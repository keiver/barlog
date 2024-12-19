import WatchConnectivity
import Foundation
import Combine

enum WatchConnectivityError: LocalizedError {
    case notActivated
    case notReachable
    case sendFailed(Error)
    
    var errorDescription: String? {
        switch self {
        case .notActivated:
            return "Watch connectivity is not activated"
        case .notReachable:
            return "Phone is not reachable"
        case .sendFailed(let error):
            return "Failed to send message: \(error.localizedDescription)"
        }
    }
}

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    // MARK: - Singleton
    static let shared = WatchConnectivityManager()
    
    // MARK: - Published Properties
    @Published private(set) var isReachable = false
    @Published private(set) var activationState: WCSessionActivationState = .notActivated
    @Published private(set) var lastError: Error?
    @Published var receivedMessage: [String: Any] = [:]

    // MARK: - Private Properties
    private let session: WCSession
    private var messageQueue: [(number: Int, completion: ((Error?) -> Void)?)] = []
    private var isProcessingQueue = false
    
    // MARK: - Initialization
    private override init() {
        self.session = WCSession.default
        super.init()
        setupSession()
    }
    
    private func setupSession() {
        guard WCSession.isSupported() else {
            print("Watch: WCSession is not supported")
            return
        }
        
        print("Watch: Setting up WCSession...")
        session.delegate = self
        session.activate()
    }
    
    // MARK: - Public Methods
    func sendNumberToPhone(_ number: Int, completion: ((Error?) -> Void)? = nil) {
        ensureSessionIsActive()
        
        guard session.isReachable else {
            print("Watch: Phone not reachable, messages queued")
            messageQueue.append((number, completion))
            return
        }
        
        session.sendMessage(
            ["number": number],
            replyHandler: { response in
                print("Watch: Message sent successfully: \(response)")
                completion?(nil)
            },
            errorHandler: { error in
                print("Watch: Failed to send message: \(error.localizedDescription)")
                completion?(WatchConnectivityError.sendFailed(error))
            }
        )
    }
    
    func sendNumberWithRetry(_ number: Int, retries: Int = 3) {
        sendNumberToPhone(number) { error in
            if let error = error, retries > 0 {
                print("Watch: Retry sending number due to error: \(error.localizedDescription). Retries left: \(retries - 1)")
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    self.sendNumberWithRetry(number, retries: retries - 1)
                }
            }
        }
    }
    
    // MARK: - Private Methods
    private func ensureSessionIsActive() {
        if session.activationState != .activated {
            print("Watch: Session not activated. Attempting to activate.")
            session.activate()
        }
    }
    
    private func processMessageQueue() {
        guard !isProcessingQueue else { return }
        guard session.isReachable else {
            print("Watch: Phone not reachable, processing paused")
            return
        }
        
        isProcessingQueue = true
        
        while !messageQueue.isEmpty {
            let (number, completion) = messageQueue.removeFirst()
            sendNumberToPhone(number, completion: completion)
        }
        
        isProcessingQueue = false
    }
    
    // MARK: - WCSessionDelegate
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            if let error = error {
                print("Watch: Session activation failed: \(error.localizedDescription)")
                self.lastError = error
                return
            }
            
            self.activationState = activationState
            self.isReachable = session.isReachable
            print("Watch: Session activation state: \(activationState.rawValue)")
            print("Watch: isReachable: \(session.isReachable)")
            
            if session.isReachable {
                self.processMessageQueue()
            }
        }
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async { [weak self] in
        self?.isReachable = session.isReachable
        if session.isReachable {
            self?.processMessageQueue()
        } else {
            print("Watch: Phone is not reachable")
        }
    }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
        DispatchQueue.main.async {
            self.receivedMessage = message
            print("Watch: Received message: \(message)")
            replyHandler(["response": "Message received"])
        }
    }
}
