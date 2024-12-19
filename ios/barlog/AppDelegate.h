#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>
#import <WatchConnectivity/WatchConnectivity.h>

#import "barlog-Bridging-Header.h"

@interface AppDelegate : EXAppDelegateWrapper <WCSessionDelegate>

@end
