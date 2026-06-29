import LegalLayout from '../components/LegalLayout';

export const metadata = {
  title: 'Terms of Service | North Ride',
  description: 'Official terms and conditions for North Ride. Understand the legal framework, user responsibilities, and service policies for our inter-city transportation platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions of Service">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Legal terms for North Ride transportation platform regarding passenger and driver responsibilities, fares, and liability.",
            "publisher": {
              "@type": "Organization",
              "name": "North Ride"
            }
          })
        }}
      />
      <div className="space-y-12 text-slate-600 font-medium leading-relaxed">
        
        {/* 1. NATURE OF SERVICE */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">1. Nature of the Service</h2>
          <p className="mb-4">
            North Ride constitutes a technology platform that links independent third-party providers of transportation services ("Drivers") with customers seeking inter-city travel ("Passengers"). 
          </p>
          <p className="text-sm bg-green-50 p-4 rounded-2xl border border-green-100 italic">
            <strong>Platform Status:</strong> North Ride acts solely as an aggregator and facilitator. We do not provide transportation or logistics services directly. Drivers are independent contractors, not employees or agents of North Ride. Any agreement for a ride is solely between the Passenger and the Driver.
          </p>
        </section>

        {/* 2. USER RESPONSIBILITIES */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">2. Passenger & Driver Responsibilities</h2>
          <p>
            By using the platform, both parties agree to maintain a safe and respectful environment:
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li><strong>Passengers:</strong> Must provide accurate pick-up/drop-off details, declare excessive luggage prior to booking, and refrain from requesting drivers to violate traffic laws.</li>
            <li><strong>Drivers:</strong> Must possess a valid driver’s license, vehicle registration, and necessary permits. Vehicles must be maintained in a safe, roadworthy condition.</li>
          </ul>
        </section>

        {/* 3. ACCEPTABLE USE */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">3. Code of Conduct & Anti-Fraud</h2>
          <p>
            To maintain platform integrity, we enforce a strict policy against misuse. The following actions are strictly prohibited:
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li>Using the service for any unlawful or illegal purpose.</li>
            <li>Soiling, damaging, or vandalizing the driver's vehicle.</li>
            <li>Creating fake accounts, submitting fraudulent payments, or manipulating the platform's booking systems.</li>
          </ul>
          <p className="mt-4 font-bold text-red-600">
            Violation of these terms may result in immediate account suspension, cancellation of scheduled rides, and potential legal action.
          </p>
        </section>

        {/* 4. FINANCIAL PROTOCOLS */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">4. Fares, Payments & Tolls</h2>
          <p className="mb-4">
            Fares are agreed upon through the platform prior to the commencement of the journey. 
          </p>
          
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-4 text-sm">
            <p className="font-bold text-slate-800 mb-2 underline">Fare Structure & Exclusions:</p>
            <p>
              The agreed-upon price includes the base transportation cost. <strong>It does not include highway tolls or specific entry taxes.</strong> Toll payments incurred during the journey must be borne by the Passenger unless explicitly agreed otherwise with the Driver.
            </p>
          </div>

          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Payment Collection:</strong> Cash or digital payments are settled directly between the Passenger and Driver upon completion of the ride.</li>
            <li><strong>Platform Fees:</strong> North Ride may deduct a service commission from the Driver for facilitating the connection, subject to current platform rates.</li>
          </ul>
        </section>

        {/* 5. CANCELLATIONS */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">5. Cancellations & Modifications</h2>
          <p className="mb-4">
            Users may cancel a request via the platform. However, to ensure fairness to our driver network, repeated or last-minute cancellations may result in restricted account access.
          </p>
          <ul className="list-disc ml-6 space-y-3">
            <li>
              <strong>Luggage Limitations:</strong> A Driver reserves the right to cancel a ride upon arrival if the Passenger's luggage significantly exceeds standard capacity or poses a safety risk, provided it was not disclosed during booking.
            </li>
            <li>
              <strong>No-Show Policy:</strong> If a Passenger fails to appear at the designated location within a reasonable timeframe, the Driver may cancel the trip.
            </li>
          </ul>
        </section>

        {/* 6. LIMITATION OF LIABILITY */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">6. Limitation of Liability</h2>
          <p>
            North Ride shall not be liable for indirect, incidental, or consequential damages arising from the use of our platform. This includes, but is not limited to, missed flights, delayed arrivals due to traffic or weather conditions, or personal disputes between users. Travel relies on external factors, and users assume the inherent risks of inter-city transit.
          </p>
        </section>

        {/* 7. DISPUTE RESOLUTION */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">7. Dispute Resolution</h2>
          <p>
            Any disputes regarding service quality, lost items, or fare disagreements must be reported to our support team within 48 hours of the ride's completion. North Ride will act as a mediator to assist in resolving the dispute, though we do not guarantee financial reimbursement for third-party actions.
          </p>
        </section>

        {/* 8. ACCEPTANCE */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">8. Acceptance of Terms</h2>
          <p>
            By creating an account and booking or providing a ride, you confirm that you are legally permitted to enter into this agreement. We reserve the right to modify these terms at any time to reflect operational changes. 
            For legal inquiries or support, please contact us via WhatsApp at <strong>03715982735</strong>.
          </p>
        </section>

        {/* LEGAL QUOTE BLOCK */}
        <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl">
          <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">Statutory Disclaimer</p>
          <p className="text-slate-400 text-xs italic leading-loose">
            "North Ride is committed to providing a secure and reliable technological framework that bridges the distance between cities. By using this service, you acknowledge that we are a software provider facilitating logistics, operating under the regulatory guidelines applicable to technology platforms."
          </p>
        </div>

      </div>
    </LegalLayout>
    
  );
}