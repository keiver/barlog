#import "WatchConnectivity.h"
#import <React/RCTLog.h>

@implementation RCTWatchConnectivity {
    BOOL hasListeners;
}

RCT_EXPORT_MODULE(RCTWatchConnectivity);

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

+ (instancetype)shared {
    static RCTWatchConnectivity *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        RCTLogInfo(@"RCTWatchConnectivity initialized");
        dispatch_async(dispatch_get_main_queue(), ^{
            RCTLogInfo(@"Setting up notification observer on main thread");
            [[NSNotificationCenter defaultCenter] addObserver:self
                                                   selector:@selector(handleWatchNumber:)
                                                       name:@"WatchReceiveMessage"
                                                     object:nil];
            RCTLogInfo(@"Notification observer setup complete");
        });
    }
    return self;
}

- (void)dealloc {
    RCTLogInfo(@"RCTWatchConnectivity deallocating");
    dispatch_async(dispatch_get_main_queue(), ^{
        [[NSNotificationCenter defaultCenter] removeObserver:self];
    });
}

#pragma mark - RCTEventEmitter methods

- (NSArray<NSString *> *)supportedEvents {
    return @[@"WatchReceiveMessage"];
}

- (void)startObserving {
    hasListeners = YES;
    RCTLogInfo(@"Phone: Started observing watch events");
}

- (void)stopObserving {
    hasListeners = NO;
    RCTLogInfo(@"Phone: Stopped observing watch events");
}

#pragma mark - React Native Methods

RCT_EXPORT_METHOD(sendUpdateToWatch:(NSDictionary *)update
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (![WCSession defaultSession].isReachable) {
        reject(@"watch_unreachable", @"Watch is not reachable", nil);
        return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        RCTLogInfo(@"Phone: Sending update to watch: %@", update);
        [[WCSession defaultSession] sendMessage:update
                                 replyHandler:^(NSDictionary<NSString *,id> *replyMessage) {
                                     RCTLogInfo(@"Phone: Watch replied: %@", replyMessage);
                                     resolve(replyMessage);
                                 }
                                 errorHandler:^(NSError *error) {
                                     RCTLogError(@"Phone: Failed to send update to watch: %@", error);
                                     reject(@"send_failed", error.localizedDescription, error);
                                 }
        ];
    });
}

#pragma mark - WCSessionDelegate methods

- (void)session:(WCSession *)session activationDidCompleteWithState:(WCSessionActivationState)activationState error:(nullable NSError *)error {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (error) {
            RCTLogError(@"Phone: Session activation failed with error: %@", error.localizedDescription);
            return;
        }
        
        switch (activationState) {
            case WCSessionActivationStateActivated:
                RCTLogInfo(@"Phone: WCSession activated successfully");
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

- (void)sessionDidBecomeInactive:(WCSession *)session {
    RCTLogInfo(@"Phone: WCSession became inactive");
    dispatch_async(dispatch_get_main_queue(), ^{
        [session activateSession];
    });
}

- (void)sessionDidDeactivate:(WCSession *)session {
    RCTLogInfo(@"Phone: WCSession deactivated");
    dispatch_async(dispatch_get_main_queue(), ^{
        [session activateSession];
    });
}

#pragma mark - Notification Handling

- (void)handleWatchNumber:(NSNotification *)notification {
    RCTLogInfo(@"Phone: Handling watch number notification");
    if (hasListeners) {
        NSNumber *number = notification.userInfo[@"number"];
        if (number) {
            NSDictionary *event = @{@"number": number};
            RCTLogInfo(@"Phone: About to emit watch event: %@", event);
            dispatch_async(dispatch_get_main_queue(), ^{
                [self sendEventWithName:@"WatchReceiveMessage" body:event];
                RCTLogInfo(@"Phone: Event emitted successfully");
            });
        } else {
            RCTLogInfo(@"Phone: No number in notification userInfo");
        }
    } else {
        RCTLogInfo(@"Phone: No listeners registered for watch events");
    }
}

@end
