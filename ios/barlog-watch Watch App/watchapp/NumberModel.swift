import Foundation
import Combine

class NumberModel: ObservableObject {
    @Published var number: Int = 0 {
        didSet {
            if number > 900 {
                number = 900
            }
            if number < 0 {
                number = 0
            }
        }
    }
    
    init(initialValue: Int = 0) {
        self.number = initialValue
    }
}
