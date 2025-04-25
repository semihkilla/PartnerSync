//
//  ContentView.swift
//  PartnerSync
//
//  Created by Semih Erden on 25.04.25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "heart")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Welcome, to a whole new Experience")
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
