import LegalLayout from '../components/LegalLayout';

export const metadata = {
  title: 'Safety Guidelines | North Ride',
  description: 'Comprehensive safety protocols, vehicle standards, and travel guidelines for all North Ride journeys.',
};

export default function SafetyPage() {
  return (
    <LegalLayout title="Trust & Safety">
      <div className="space-y-12 text-slate-600 font-medium leading-relaxed">
        
        {/* 1. VEHICLE STANDARDS */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">1. Stringent Vehicle Standards</h2>
          <p className="mb-4">
            Passenger safety begins before the engine starts. Every vehicle operating on the North Ride network must adhere to strict maintenance and performance criteria.
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li><strong>Routine Inspections:</strong> Tires, brakes, and suspension systems must be regularly inspected, particularly for vehicles operating on demanding terrains.</li>
            <li><strong>Safety Equipment:</strong> All vehicles must be equipped with functional seatbelts for every passenger, a basic first-aid kit, and a spare tire in good condition.</li>
            <li><strong>Climate Control:</strong> Working heating and air conditioning are mandatory to ensure passenger comfort and prevent driver fatigue across varying climate zones.</li>
          </ul>
        </section>

        {/* 2. MOUNTAIN & LONG-HAUL PROTOCOLS */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">2. Long-Haul & Mountain Route Protocols</h2>
          <p className="mb-4">
            Inter-city travel often involves challenging topographies. For extended journeys and mountain corridors—such as the routes connecting Islamabad to Gilgit and Skardu—we enforce specialized safety measures.
          </p>
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-4 text-sm">
            <p className="font-bold text-slate-800 mb-2 underline">High-Altitude & Weather Mandates:</p>
            <p>
              Drivers are authorized to delay, pause, or cancel trips in the event of severe weather warnings, landslides, or drastically reduced visibility. The safety of the passengers and the driver always supersedes the travel schedule.
            </p>
          </div>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Rest Stops:</strong> Drivers are encouraged to take mandatory rest breaks every few hours to maintain optimal focus and cognitive reaction time.</li>
            <li><strong>Daylight Preference:</strong> Whenever possible, traversing complex mountain passes is highly recommended during daylight hours.</li>
          </ul>
        </section>

        {/* 3. DRIVER COMMITMENT */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">3. Driver Code of Conduct</h2>
          <p>
            Drivers on our platform are expected to operate with the highest level of professionalism and care.
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li><strong>Speed Limits:</strong> Strict adherence to local speed limits is non-negotiable. Over-speeding is grounds for immediate platform review.</li>
            <li><strong>Distraction-Free Driving:</strong> The use of mobile phones for texting or calling (without a hands-free system) while the vehicle is in motion is strictly prohibited.</li>
            <li><strong>Zero Tolerance:</strong> Operating a vehicle under the influence of any impairing substance will result in a permanent and irreversible ban from the North Ride platform.</li>
          </ul>
        </section>

        {/* 4. PASSENGER RESPONSIBILITIES */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">4. Passenger Responsibilities</h2>
          <p className="mb-4">
            Safety is a shared responsibility. We ask our passengers to contribute to a secure journey by observing the following:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Seatbelts:</strong> Always wear your seatbelt for the entire duration of the trip, regardless of where you are seated in the vehicle.</li>
            <li><strong>Luggage Limits:</strong> Ensure all luggage is securely stowed. Overloading the vehicle alters its center of gravity and braking distance.</li>
            <li><strong>Respectful Environment:</strong> Avoid distracting the driver. A calm environment allows the driver to concentrate fully on the road.</li>
          </ul>
        </section>

        {/* 5. INCIDENT REPORTING */}
        <section>
          <h2 className="text-slate-900 font-black uppercase tracking-tight text-lg mb-4">5. 24/7 Incident Reporting</h2>
          <p>
            If you ever feel unsafe during a ride, or if you observe a vehicle that does not meet our safety standards, please report it immediately. Our support team prioritizes all safety-related tickets. You can reach our dedicated safety line directly via WhatsApp at <strong>03715982735</strong>.
          </p>
        </section>

        {/* LEGAL QUOTE BLOCK */}
        <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl">
          <p className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">North Ride Safety Pledge</p>
          <p className="text-slate-400 text-xs italic leading-loose">
            "We believe that distance should never compromise security. Our platform is built on the fundamental principle that every journey must begin with meticulous preparation and end with a safe arrival."
          </p>
        </div>

      </div>
    </LegalLayout>
  );
}