import SwiftUI
import WatchKit

struct ContentView: View {
    @StateObject private var connectivityManager = WatchConnectivityManager.shared
    @StateObject private var model = NumberModel()
    @State private var rotationValue: Double = 0
    @FocusState private var isFocused: Bool
    
    var body: some View {
        GeometryReader { geometry in
            VStack {
                Spacer()
                
                Text("\(Int(rotationValue))")
                    .font(.system(size: 40))
                    .foregroundColor(.yellow)
                    .frame(maxWidth: .infinity)
                    .focusable(true)
                    .focused($isFocused)
                    .digitalCrownRotation(
                        $rotationValue,
                        from: 0,
                        through: 900,
                        by: 1,
                        sensitivity: .medium,
                        isContinuous: false,
                        isHapticFeedbackEnabled: true
                    )
                    .onChange(of: rotationValue) { _ in
                        handleRotationChange()
                    }
                
                Spacer()
                
                if !connectivityManager.isReachable {
                    Text("Phone Not Connected")
                        .font(.footnote)
                        .foregroundColor(.red)
                        .padding(.bottom, 4)
                }
            }
            .frame(width: geometry.size.width)
        }
        .edgesIgnoringSafeArea(.all)
        .onAppear {
            isFocused = true
        }
    }
    
    private func handleRotationChange() {
        let value = Int(rotationValue)
        model.number = value
        
        // Debounce sending updates
        Task {
            try? await Task.sleep(nanoseconds: 100_000_000) // 100ms debounce
            guard value == Int(rotationValue) else { return }
            
            connectivityManager.sendNumberToPhone(value) { error in
                if let error = error {
                    print("Watch: Failed to send number: \(error.localizedDescription)")
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
