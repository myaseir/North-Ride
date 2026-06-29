import LegalLayout from '../components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy | North Ride',
  description: 'How North Ride protects user data and ensures secure, reliable city-to-city transportation.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <div className="space-y-12 text-slate-600 font-medium leading-relaxed">
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">1. Data Collection & Usage</h2>
          <p>
            To provide safe and reliable inter-city transportation, we collect essential information including your <strong>Name</strong>, 
            <strong> Phone Number</strong>, <strong>Pickup and Drop-off Locations</strong>, and <strong>Ride History</strong>. 
            We utilize secure encryption for all data in transit. North Ride strictly respects your privacy and does not sell your personal data to third-party advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">2. Journey Safety & Verification</h2>
          <p>
            For your security during travel, location data may be actively monitored while a ride is in progress. Any digital payment or billing information is processed through industry-standard encrypted channels. 
            User verification data is strictly used to prevent fraudulent bookings, manage incidents, and ensure a secure travel environment for both passengers and drivers.
          </p>
        </section>

        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">3. Right to Erasure</h2>
          <p>
            In compliance with modern data protection standards, users may request the deletion of their profile and travel data. 
            All personally identifiable information will be purged within 30 days of the request, provided the account is not currently subject 
            to an active investigation regarding safety incidents, legal claims, or unsettled fare disputes.
          </p>
        </section>

        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">4. Contact & Support</h2>
          <p>
            Data privacy inquiries, account deletion requests, and general support can be directed to the Glacia Labs administration team. You can reach us directly via WhatsApp at <strong>03715982735</strong>.
          </p>
        </section>

        <div className="p-8 bg-slate-950 rounded-[2.5rem] text-slate-400 text-xs italic border border-white/5">
          "North Ride utilizes advanced security measures to protect the personal information, location data, and travel history of every passenger on our routes."
        </div>
      </div>
    </LegalLayout>
  );
}