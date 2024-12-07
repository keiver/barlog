#import "WatchConnectivity.h"
#import <React/RCTLog.h>

@implementation RCTWatchConnectivity

RCT_EXPORT_MODULE();

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
        if ([WCSession isSupported]) {
            self.session = [WCSession defaultSession];
            self.session.delegate = self;
            [self.session activateSession];
            self.isReady = YES;
            RCTLogInfo(@"WCSession activated");
        } else {
            self.isReady = NO;
            RCTLogWarn(@"WCSession not supported on this device");
        }
    }
    return self;
}

// Expose a method to check if the module is ready
RCT_EXPORT_METHOD(isReady:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@(self.isReady));
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"WatchMessage"];
}

// MARK: - WCSessionDelegate Methods

- (void)session:(WCSession *)session activationDidCompleteWithState:(WCSessionActivationState)activationState error:(nullable NSError *)error {
    if (error) {
        [self sendEventWithName:@"WatchMessage" body:@{@"error": error.localizedDescription}];
    } else {
        [self sendEventWithName:@"WatchMessage" body:@{@"state": @(activationState)}];
    }
}

- (void)sessionDidBecomeInactive:(WCSession *)session {
    [self sendEventWithName:@"WatchMessage" body:@{@"event": @"sessionDidBecomeInactive"}];
}

- (void)sessionDidDeactivate:(WCSession *)session {
    [self sendEventWithName:@"WatchMessage" body:@{@"event": @"sessionDidDeactivate"}];
    [session activateSession]; // Reactivate the session
}

- (void)session:(WCSession *)session didReceiveMessage:(NSDictionary<NSString *, id> *)message replyHandler:(void (^)(NSDictionary<NSString *, id> *))replyHandler {
    [self sendEventWithName:@"WatchMessage" body:message];
    if (replyHandler) {
        replyHandler(@{@"status": @"received"});
    }
}

- (void)session:(WCSession *)session didReceiveMessageData:(NSData *)messageData replyHandler:(void (^)(NSData *))replyHandler {
    [self sendEventWithName:@"WatchMessage" body:@{@"data": messageData}];
    if (replyHandler) {
        replyHandler([@"acknowledged" dataUsingEncoding:NSUTF8StringEncoding]);
    }
}

// MARK: - Utilities

- (void)sendEventWithName:(NSString *)name body:(id)body {
    if (self.bridge) {
        [super sendEventWithName:name body:body];
    } else {
        RCTLogWarn(@"Bridge not set. Unable to send event %@", name);
    }
}

@end
