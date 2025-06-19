import SwiftUI

struct AuthView: View {
    @State private var email: String = ""
    @State private var password: String = ""
    var onAuth: (() -> Void)?

    var body: some View {
        VStack {
            TextField("Email", text: $email)
                .textFieldStyle(.roundedBorder)
            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)
            HStack {
                Button("Sign Up") {
                    // TODO: integrate Firebase Auth
                    onAuth?()
                }
                Button("Sign In") {
                    // TODO: integrate Firebase Auth
                    onAuth?()
                }
            }
        }
        .padding()
    }
}

#Preview {
    AuthView()
}
