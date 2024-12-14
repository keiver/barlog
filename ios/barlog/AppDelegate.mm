#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <WatchConnectivity/WatchConnectivity.h>
#import <React/RCTLog.h>

@interface AppDelegate () <WCSessionDelegate>
@property (nonatomic, strong) WCSession *watchSession;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";
  self.initialProps = @{};

  // Initialize Watch Connectivity on main thread only for iPhone
  dispatch_async(dispatch_get_main_queue(), ^{
    // Check if device is iPhone before attempting WCSession
    if ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPhone && [WCSession isSupported]) {
      RCTLogInfo(@"Phone: WCSession is supported, initializing...");
      self.watchSession = [WCSession defaultSession];
      self.watchSession.delegate = self;
      [self.watchSession activateSession];
      RCTLogInfo(@"Phone: WCSession activation requested. Current state: %ld", (long)self.watchSession.activationState);
      RCTLogInfo(@"Phone: Initial reachability: %d", self.watchSession.isReachable);
    } else {
      RCTLogInfo(@"Device does not support WatchConnectivity - skipping initialization");
    }
  });

  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];
  return result;
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

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

#pragma mark - WCSessionDelegate Methods

- (void)session:(WCSession *)session activationDidCompleteWithState:(WCSessionActivationState)activationState error:(NSError *)error {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (error) {
            RCTLogError(@"Phone: Session activation failed: %@", error.localizedDescription);
            return;
        }
        
        switch (activationState) {
            case WCSessionActivationStateActivated:
                RCTLogInfo(@"Phone: WCSession activated successfully. Reachable: %d", session.isReachable);
                break;
            case WCSessionActivationStateInactive:
                RCTLogInfo(@"Phone: WCSession is inactive");
                break;
            case WCSessionActivationStateNotActivated:
                RCTLogInfo(@"Phone: WCSession is not activated");
                break;
        }
    });
}

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message {
    NSNumber *number = message[@"number"];
    if (number) {
        RCTLogInfo(@"Phone: Received number from watch: %@", number);
        dispatch_async(dispatch_get_main_queue(), ^{
            RCTLogInfo(@"Phone: Broadcasting number via notification: %@", number);
            [[NSNotificationCenter defaultCenter] postNotificationName:@"WatchReceiveMessage"
                                                              object:nil
                                                            userInfo:@{@"number": number}];
            RCTLogInfo(@"Phone: Notification posted with number: %@", number);
        });
    } else {
        RCTLogInfo(@"Phone: Received message without number: %@", message);
    }
}

// send updates to the watch
- (void)sendUpdateToWatch:(NSDictionary *)update {
    if (![WCSession defaultSession].isReachable) {
        RCTLogInfo(@"Phone: Watch is not reachable, skipping update");
        return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [[WCSession defaultSession] sendMessage:update
                                 replyHandler:^(NSDictionary<NSString *, id> *replyMessage) {
                                     RCTLogInfo(@"Phone: Watch received update: %@", replyMessage);
                                 }
                                 errorHandler:^(NSError *error) {
                                     RCTLogError(@"Phone: Failed to send update to watch: %@", error);
                                 }];
    });
}


- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message replyHandler:(void(^)(NSDictionary<NSString *, id> *replyMessage))replyHandler {
    NSNumber *number = message[@"number"];
    if (number) {
         RCTLogInfo(@"Phone: Received number from watch: %@", number);
         dispatch_async(dispatch_get_main_queue(), ^{
             // Send the notification for React Native
             [[NSNotificationCenter defaultCenter] postNotificationName:@"WatchReceiveMessage"
                                                               object:nil
                                                             userInfo:@{@"number": number}];
             
             // Send back current state to watch
             NSDictionary *response = @{
                 @"weight": number,
                 @"label": @"", // You'll need to get this from your RN state
                 @"unit": @"lb", // You'll need to get this from your RN state
                 @"status": @"received"
             };
             
             replyHandler(response);
             
             // Also proactively send an update with full state
             [self sendUpdateToWatch:response];
         });
     } else {
         replyHandler(@{@"status": @"error", @"message": @"No number received"});
     }
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
    RCTLogInfo(@"Phone: WCSession became inactive. Attempting to reactivate...");
    dispatch_async(dispatch_get_main_queue(), ^{
        [session activateSession];
    });
}

- (void)sessionDidDeactivate:(WCSession *)session {
    RCTLogInfo(@"Phone: WCSession deactivated. Attempting to reactivate...");
    dispatch_async(dispatch_get_main_queue(), ^{
        [session activateSession];
    });
}

- (void)sessionReachabilityDidChange:(WCSession *)session {
    RCTLogInfo(@"Phone: Session reachability changed. Reachable: %d", session.isReachable);
}

@end
