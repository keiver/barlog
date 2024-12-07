#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <WatchConnectivity/WatchConnectivity.h>

@interface RCTWatchConnectivity : RCTEventEmitter <RCTBridgeModule, WCSessionDelegate>
+ (instancetype)shared;
@property (nonatomic, strong) WCSession *session;
@property (nonatomic, assign) BOOL isReady;
@end
