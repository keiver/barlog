import SwiftUI
import WatchKit
import WatchConnectivity

struct ContentView: View {
    @StateObject private var connectivityManager = WatchConnectivityManager.shared
    @StateObject private var model = NumberModel()
    @State private var rotationValue: Double = 0
    @FocusState private var isFocused: Bool // Handles focusable state for Digital Crown

    var body: some View {
        ScrollView {
            VStack {
                Spacer()
                
                Text("\(Int(rotationValue))")
                    .font(.system(size: 40))
                    .foregroundColor(.yellow)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .focusable(true) // Ensures interaction with Digital Crown
                    .focused($isFocused) // Links FocusState for Digital Crown
                    .onAppear {
                        if #available(watchOS 9.6, *) {
                            isFocused = true
                        }
                    }

                Spacer()
                
                // Show connection status
                if !connectivityManager.isReachable {
                    Text("Phone Not Connected")
                        .font(.footnote)
                        .foregroundColor(.red)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .digitalCrownRotation(
            $rotationValue,
            from: 0,
            through: 900,
            by: 1,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: rotationValue) { newValue in
            Task {
                await sendValue(Int(newValue))
            }
        }
    }

    private func sendValue(_ value: Int) async {
        // Throttle rapid sends
        try? await Task.sleep(nanoseconds: 250_000_000) // 250ms debounce

        guard Int(rotationValue) == value else { return } // Skip outdated values

        model.number = value // Update local model

        // Send to phone
        connectivityManager.sendNumberToPhone(value) { result in
            if case .failure(let error) = result {
                print("Error sending number: \(error)")
            }
        }
    }
}

#Preview {
    ContentView()
}
