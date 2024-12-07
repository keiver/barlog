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
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Initialize Watch Connectivity before super call
  if ([WCSession isSupported]) {
    RCTLogInfo(@"Phone: WCSession is supported, initializing...");
    self.watchSession = [WCSession defaultSession];
    self.watchSession.delegate = self;
    [self.watchSession activateSession];
    RCTLogInfo(@"Phone: WCSession activation requested");
  } else {
    RCTLogError(@"Phone: WCSession is not supported on this device");
  }

//  RCTWatchConnectivity *watchConnectivity = [RCTWatchConnectivity shared];
//  RCTLogInfo(@"Phone: RCTWatchConnectivity shared instance retrieved");

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
                RCTLogInfo(@"Phone: WCSession activated");
                break;
            case WCSessionActivationStateInactive:
                RCTLogInfo(@"Phone: WCSession inactive");
                break;
            case WCSessionActivationStateNotActivated:
                RCTLogInfo(@"Phone: WCSession not activated");
                break;
        }
    });
}

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message {
    NSNumber *number = message[@"number"];
    if (number) {
        RCTLogInfo(@"Phone: Received number from watch: %@", number);
        dispatch_async(dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:@"WatchReceiveMessage"
                                                              object:nil
                                                            userInfo:@{@"number": number}];
            RCTLogInfo(@"Phone: Notification posted with number: %@", number);
        });
    }
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
    RCTLogInfo(@"Phone: WCSession became inactive");
}

- (void)sessionDidDeactivate:(WCSession *)session {
    RCTLogInfo(@"Phone: WCSession deactivated, reactivating...");
    [session activateSession];
}

@end
