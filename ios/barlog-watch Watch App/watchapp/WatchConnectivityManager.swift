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

class WatchConnectivityManager: NSObject, ObservableObject {
    // MARK: - Singleton
    static let shared = WatchConnectivityManager()
    
    // MARK: - Published Properties
    @Published private(set) var isReachable = false
    @Published private(set) var activationState: WCSessionActivationState = .notActivated
    @Published private(set) var lastError: Error?
    
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
        // Add to queue
        messageQueue.append((number: number, completion: completion))
        processMessageQueue()
    }
    
    // MARK: - Private Methods
    private func processMessageQueue() {
        guard !isProcessingQueue else { return }
        guard activationState == .activated else {
            print("Watch: Session not activated, messages queued")
            return
        }
        guard session.isReachable else {
            print("Watch: Phone not reachable, messages queued")
            return
        }
        
        isProcessingQueue = true
        
        while !messageQueue.isEmpty {
            let (number, completion) = messageQueue.removeFirst()
            
            print("Watch: Sending number \(number) to phone")
            session.sendMessage(
                ["number": number],
                replyHandler: { response in
                    print("Watch: Message sent successfully: \(response)")
                    completion?(nil)
                },
                errorHandler: { error in
                    print("Watch: Failed to send message: \(error.localizedDescription)")
                    completion?(WatchConnectivityError.sendFailed(error))
                    // On error, stop processing queue
                    self.isProcessingQueue = false
                }
            )
        }
        
        isProcessingQueue = false
    }
}

// MARK: - WCSessionDelegate
extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async { [weak self] in
            if let error = error {
                print("Watch: Session activation failed: \(error.localizedDescription)")
                self?.lastError = error
                return
            }
            
            self?.activationState = activationState
            self?.isReachable = session.isReachable
            
            print("Watch: Session activation state: \(activationState.rawValue)")
            print("Watch: isReachable: \(session.isReachable)")
            
            if activationState == .activated {
                self?.processMessageQueue()
            }
        }
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async { [weak self] in
            self?.isReachable = session.isReachable
            print("Watch: Reachability changed. Is reachable: \(session.isReachable)")
            
            if session.isReachable {
                self?.processMessageQueue()
            }
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        print("Watch: Received message: \(message)")
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
        print("Watch: Received message with reply handler: \(message)")
        replyHandler(["status": "received"])
    }
}
