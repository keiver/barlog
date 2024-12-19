// ios/WatchConnectivity/RCTWatchConnectivity.h
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <RCTWatchConnectivitySpec/RCTWatchConnectivitySpec.h>

@interface RCTWatchConnectivity : RCTEventEmitter <RCTBridgeModule, NativeWatchConnectivitySpec>
@end
