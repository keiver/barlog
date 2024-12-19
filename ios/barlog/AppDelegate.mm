#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <WatchConnectivity/WatchConnectivity.h>
#import <React/RCTLog.h>

@interface AppDelegate () <WCSessionDelegate>
@property (nonatomic, strong) WCSession *watchSession;
@property (nonatomic, assign) BOOL sessionActivated;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";
  self.initialProps = @{};

  // Initialize Watch Connectivity on main thread only for iPhone
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPhone && [WCSession isSupported]) {
      RCTLogInfo(@"Phone: WCSession is supported, initializing...");
      self.watchSession = [WCSession defaultSession];
      self.watchSession.delegate = self;
      [self.watchSession activateSession];
      RCTLogInfo(@"Phone: WCSession activation requested.");
    } else {
      RCTLogInfo(@"Device does not support WatchConnectivity - skipping initialization");
    }
  });

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// WCSessionDelegate Methods
- (void)session:(WCSession *)session activationDidCompleteWithState:(WCSessionActivationState)activationState error:(NSError *)error {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (error) {
      RCTLogError(@"Phone: Session activation failed: %@", error.localizedDescription);
      self.sessionActivated = NO;
      return;
    }
    
    self.sessionActivated = (activationState == WCSessionActivationStateActivated);
    RCTLogInfo(@"Phone: Session activation completed with state: %ld", (long)activationState);
    RCTLogInfo(@"Phone: Reachable: %d", session.isReachable);
  });
}

- (void)sessionReachabilityDidChange:(WCSession *)session {
  RCTLogInfo(@"Phone: Session reachability changed. Reachable: %d", session.isReachable);
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
  RCTLogInfo(@"Phone: WCSession became inactive. Reactivating...");
  [session activateSession];
}

- (void)sessionDidDeactivate:(WCSession *)session {
  RCTLogInfo(@"Phone: WCSession deactivated. Reactivating...");
  [session activateSession];
}

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message replyHandler:(void (^)(NSDictionary<NSString *, id> *))replyHandler {
  NSNumber *number = message[@"number"];
  if (number) {
    RCTLogInfo(@"Phone: Received number from watch: %@", number);
    [[NSNotificationCenter defaultCenter] postNotificationName:@"WatchReceiveMessage" object:nil userInfo:@{ @"number": number }];
    replyHandler(@{ @"status": @"received" });
  } else {
    replyHandler(@{ @"status": @"error", @"message": @"No number received" });
  }
}

// Retry mechanism for sending messages
- (void)sendMessageToWatch:(NSDictionary *)message retries:(NSInteger)retries {
  if (!self.sessionActivated) {
    RCTLogError(@"Phone: WCSession is not activated. Cannot send message.");
    return;
  }

  if (!self.watchSession.isReachable) {
    RCTLogError(@"Phone: Watch is not reachable.");
    return;
  }

  [self.watchSession sendMessage:message
                    replyHandler:^(NSDictionary<NSString *, id> *replyMessage) {
                      RCTLogInfo(@"Phone: Message sent successfully: %@", replyMessage);
                    }
                    errorHandler:^(NSError *error) {
                      RCTLogError(@"Phone: Failed to send message: %@", error.localizedDescription);
                      if (retries > 0) {
                        RCTLogInfo(@"Phone: Retrying to send message. Retries left: %ld", (long)(retries - 1));
                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                          [self sendMessageToWatch:message retries:retries - 1];
                        });
                      }
                    }];
}

@end
