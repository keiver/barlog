#import "WatchConnectivity.h"
#import <React/RCTLog.h>

@implementation RCTWatchConnectivity {
    BOOL hasListeners;
}

RCT_EXPORT_MODULE();

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
        // Don't setup WCSession here since AppDelegate handles it
        [[NSNotificationCenter defaultCenter] addObserver:self
                                               selector:@selector(handleWatchNumber:)
                                                   name:@"WatchReceiveMessage"
                                                 object:nil];
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

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

- (void)handleWatchNumber:(NSNotification *)notification {
    RCTLogInfo(@"Phone: Handling watch number notification");
    if (hasListeners) {
        NSNumber *number = notification.userInfo[@"number"];
        if (number) {
            NSDictionary *event = @{@"number": number};
            RCTLogInfo(@"Phone: Emitting watch event: %@", event);
            [self sendEventWithName:@"WatchReceiveMessage" body:event];
        }
    } else {
        RCTLogInfo(@"Phone: No listeners registered for watch events");
    }
}

@end