import SwiftUI

// MARK: - ROOT

struct ContentView: View {
    var body: some View {
        NavigationStack {
            HomeView()
        }
        .preferredColorScheme(.dark)
    }
}

// MARK: - HOME

struct HomeView: View {
    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 28) {

                    // Header
                    VStack(alignment: .leading, spacing: 6) {
                        Text("NUTRIFINDER.AI")
                            .font(.system(size: 34, weight: .semibold, design: .rounded))

                        Text("Ingredient intelligence, uncompromised.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.horizontal, 24)

                    ScanHeroCard()

                    VStack(spacing: 12) {
                        NavRow(title: "SCAN HISTORY", icon: "clock", destination: HistoryView())
                        NavRow(title: "ABOUT SYSTEM", icon: "info.circle", destination: AboutView())
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.top, 24)
                .padding(.bottom, 40)
            }
        }
    }
}

// MARK: - HERO CARD

struct ScanHeroCard: View {
    var body: some View {
        NavigationLink {
            ScanView()
        } label: {
            VStack(alignment: .leading, spacing: 18) {

                HStack {
                    Image(systemName: "barcode.viewfinder")
                        .font(.system(size: 36))
                    Spacer()
                    Text("v0.1")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Text("SCAN FOOD PRODUCT")
                    .font(.system(size: 22, weight: .semibold, design: .rounded))

                Text("Identify additives. Assess risk. Receive alternatives.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                Divider().opacity(0.6)

                HStack {
                    Text("EXECUTE SCAN")
                        .font(.headline)
                    Spacer()
                    Image(systemName: "arrow.right")
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .glassCard()
        }
        .padding(.horizontal, 20)
        .buttonStyle(.plain)
    }
}

// MARK: - SCAN PAGE

struct ScanView: View {
    @State private var goToResults = false

    var body: some View {
        ZStack {
            LiquidBackground()

            VStack(spacing: 26) {

                Image(systemName: "camera.viewfinder")
                    .font(.system(size: 72))
                    .opacity(0.9)

                Text("SCANNING MODULE")
                    .font(.system(size: 20, weight: .semibold, design: .rounded))

                Text("Barcode / OCR pipeline placeholder")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Button {
                    goToResults = true
                } label: {
                    Text("TERMINATE SCAN")
                        .frame(maxWidth: .infinity)
                        .glassButton()
                }

                NavigationLink(
                    destination: ScanResultView(),
                    isActive: $goToResults
                ) { EmptyView() }
            }
            .padding()
        }
        .navigationTitle("Scan")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - RESULTS PAGE

struct ScanResultView: View {
    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {

                    Text("DETECTED CHEMICALS")
                        .font(.system(size: 22, weight: .semibold, design: .rounded))

                    NavigationLink {
                        ChemicalDetailView(
                            name: "Sodium Benzoate",
                            origin: "Synthetic preservative",
                            purpose: "Prevents microbial growth",
                            effects: "Linked to hyperactivity in children",
                            alternatives: "Vitamin C, refrigeration"
                        )
                    } label: {
                        ChemicalRow(name: "SODIUM BENZOATE", risk: "MEDIUM RISK")
                    }

                    NavigationLink {
                        ChemicalDetailView(
                            name: "High Fructose Corn Syrup",
                            origin: "Corn-derived sweetener",
                            purpose: "Low-cost sugar replacement",
                            effects: "Obesity, insulin resistance",
                            alternatives: "Honey, jaggery, cane sugar"
                        )
                    } label: {
                        ChemicalRow(name: "HFCS", risk: "HIGH RISK")
                    }

                    NavigationLink {
                        HistoryView()
                    } label: {
                        Text("VIEW HISTORY")
                            .frame(maxWidth: .infinity)
                            .glassButton()
                    }
                    .padding(.top, 12)
                }
                .padding()
            }
        }
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - CHEMICAL DETAIL

struct ChemicalDetailView: View {
    let name: String
    let origin: String
    let purpose: String
    let effects: String
    let alternatives: String

    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {

                    Text(name.uppercased())
                        .font(.system(size: 24, weight: .semibold, design: .rounded))

                    InfoCard(title: "ORIGIN", text: origin)
                    InfoCard(title: "PURPOSE", text: purpose)
                    InfoCard(title: "HEALTH EFFECTS", text: effects)
                    InfoCard(title: "ALTERNATIVES", text: alternatives)
                }
                .padding()
            }
        }
        .navigationTitle("Detail")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - HISTORY

struct HistoryView: View {
    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {

                    Text("SCAN HISTORY")
                        .font(.system(size: 22, weight: .semibold, design: .rounded))

                    HistoryRow(food: "SOFT DRINK", date: "YESTERDAY")
                    HistoryRow(food: "PACKAGED BREAD", date: "2 DAYS AGO")
                    HistoryRow(food: "PROTEIN BAR", date: "LAST WEEK")
                }
                .padding()
            }
        }
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - ABOUT

struct AboutView: View {
    var body: some View {
        ZStack {
            LiquidBackground()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    Text("ABOUT SYSTEM")
                        .font(.system(size: 22, weight: .semibold, design: .rounded))

                    Text("""
NutriFinder is an ingredient intelligence system.

It analyzes food labels, flags chemical risks,
and proposes safer consumption alternatives.
""")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                }
                .padding()
            }
        }
        .navigationTitle("About")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - COMPONENTS

struct ChemicalRow: View {
    let name: String
    let risk: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(name)
                    .font(.headline)
                Text(risk)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.secondary)
        }
        .padding()
        .glassCard(cornerRadius: 16)
    }
}

struct InfoCard: View {
    let title: String
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(text)
                .font(.footnote)
        }
        .padding()
        .glassCard(cornerRadius: 16)
    }
}

struct HistoryRow: View {
    let food: String
    let date: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(food)
                Text(date)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .glassCard(cornerRadius: 16)
    }
}

struct NavRow<Destination: View>: View {
    let title: String
    let icon: String
    let destination: Destination

    var body: some View {
        NavigationLink(destination: destination) {
            HStack {
                Image(systemName: icon)
                Text(title)
                    .font(.headline)
                Spacer()
                Image(systemName: "chevron.right")
            }
            .padding()
            .glassCard(cornerRadius: 16)
        }
        .foregroundStyle(.primary)
    }
}

// MARK: - GLASS + BACKGROUND

extension View {
    func glassCard(cornerRadius: CGFloat = 20) -> some View {
        self
            .background {
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .stroke(Color.white.opacity(0.25), lineWidth: 1)
                    }
            }
    }

    func glassButton() -> some View {
        self
            .font(.headline)
            .padding()
            .background {
                RoundedRectangle(cornerRadius: 16)
                    .fill(.thinMaterial)
            }
    }
}

struct LiquidBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color.black,
                    Color.blue.opacity(0.35),
                    Color.green.opacity(0.15)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            Circle()
                .fill(Color.green.opacity(0.18))
                .blur(radius: 140)
                .offset(x: 140, y: -200)
        }
    }
}

// MARK: - PREVIEW

#Preview {
    ContentView()
}
