// ios/WatchConnectivity/RCTWatchConnectivityModule.mm
#import "RCTWatchConnectivityModule.h"
#import <WatchConnectivity/WatchConnectivity.h>
#import <RCTWatchConnectivitySpec/RCTWatchConnectivitySpec.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RCTWatchConnectivitySpec/RCTWatchConnectivitySpec.h>
#endif

#import <React/RCTLog.h>
#import <React/RCTUtils.h>

@interface RCTWatchConnectivityModule () <WCSessionDelegate>
@property (nonatomic, strong) WCSession *session;
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation RCTWatchConnectivityModule {
    NSMutableArray<NSDictionary *> *_pendingEvents;
}

RCT_EXPORT_MODULE(RCTWatchConnectivitySpec)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    if (self = [super init]) {
        RCTLogInfo(@"RCTWatchConnectivityModule initialized");
        _pendingEvents = [NSMutableArray new];
        dispatch_async(dispatch_get_main_queue(), ^{
            if ([WCSession isSupported]) {
                self.session = [WCSession defaultSession];
                self.session.delegate = self;
                [self.session activateSession];
                RCTLogInfo(@"Watch session activated");
            }
        });
    }
    return self;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeWatchConnectivitySpecJSI>(params);
}
#endif

- (NSDictionary *)constantsToExport {
    return @{@"WATCH_NUMBER_EVENT": @"WatchReceiveMessage"};
}

RCT_EXPORT_METHOD(sendUpdateToWatch:(NSDictionary *)update
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (![WCSession defaultSession].isReachable) {
        reject(@"watch_unreachable", @"Watch is not reachable", nil);
        return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTLogInfo(@"Sending update to watch: %@", update);
        [[WCSession defaultSession] sendMessage:update
                                 replyHandler:^(NSDictionary<NSString *,id> *replyMessage) {
                                     RCTLogInfo(@"Watch replied: %@", replyMessage);
                                     resolve(replyMessage);
                                 }
                                 errorHandler:^(NSError *error) {
                                     RCTLogError(@"Failed to send update to watch: %@", error);
                                     reject(@"send_failed", error.localizedDescription, error);
                                 }
        ];
    });
}

#pragma mark - WCSessionDelegate Methods

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message {
    NSNumber *number = message[@"number"];
    if (number) {
        RCTLogInfo(@"Received number from watch: %@", number);
        if (self.hasListeners) {
            [self sendEventWithName:@"WatchReceiveMessage" body:@{@"number": number}];
        } else {
            [_pendingEvents addObject:@{@"number": number}];
        }
    }
}

- (void)session:(WCSession *)session activationDidCompleteWithState:(WCSessionActivationState)activationState error:(NSError *)error {
    if (error) {
        RCTLogError(@"Session activation failed: %@", error.localizedDescription);
        return;
    }
    
    RCTLogInfo(@"Session activation completed: %ld", (long)activationState);
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
    RCTLogInfo(@"Session became inactive");
}

- (void)sessionDidDeactivate:(WCSession *)session {
    RCTLogInfo(@"Session deactivated");
    // Reactivate session
    dispatch_async(dispatch_get_main_queue(), ^{
        [session activateSession];
    });
}

#pragma mark - RCTEventEmitter Methods

- (NSArray<NSString *> *)supportedEvents {
    return @[@"WatchReceiveMessage"];
}

- (void)startObserving {
    self.hasListeners = YES;
    // Send any pending events
    for (NSDictionary *event in _pendingEvents) {
        [self sendEventWithName:@"WatchReceiveMessage" body:event];
    }
    [_pendingEvents removeAllObjects];
}

- (void)stopObserving {
    self.hasListeners = NO;
}

// Handle errors during message delivery
- (void)session:(WCSession *)session didFinishUserInfoTransfer:(WCSessionUserInfoTransfer *)userInfoTransfer error:(NSError *)error {
    if (error) {
        RCTLogError(@"UserInfo transfer failed: %@", error.localizedDescription);
    } else {
        RCTLogInfo(@"UserInfo transfer completed successfully.");
    }
}

// Handle errors during file transfer (if used)
- (void)session:(WCSession *)session didFinishFileTransfer:(WCSessionFileTransfer *)fileTransfer error:(NSError *)error {
    if (error) {
        RCTLogError(@"File transfer failed: %@", error.localizedDescription);
    } else {
        RCTLogInfo(@"File transfer completed successfully.");
    }
}

// Handle messages with reply handlers
- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message replyHandler:(void (^)(NSDictionary<NSString *, id> *))replyHandler {
    NSNumber *number = message[@"number"];
    if (number) {
        RCTLogInfo(@"Received number from watch: %@", number);
        if (self.hasListeners) {
            [self sendEventWithName:@"WatchReceiveMessage" body:@{@"number": number}];
        } else {
            [_pendingEvents addObject:@{@"number": number}];
        }
        replyHandler(@{@"status": @"received"});
    } else {
        replyHandler(@{@"status": @"error", @"message": @"No number received"});
    }
}

@end
