import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRoleEnum
from app.models.campaign import Campaign
from app.models.forum import ForumThread, ForumComment
from app.models.emergency import EmergencyAlert
from app.models.transparency import TransparencyLog
from app.models.event import Event
from app.models.blog import Blog, BlogComment
from app.models.volunteer import Volunteer, VolunteerSkill, VolunteerHours, VolunteerBadge
from app.models.donation import Donation, RecurringDonation, DonationStatus
from app.models.resource import ResourceTracking
from app.models.notification import Notification
from datetime import datetime, timezone, timedelta
import uuid

async def seed_data():
    # Step 0: Clean slate schema rebuild
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        print("--- STEP 1: SEEDING USERS & MULTI-USER ROLES ---")
        # 1. Super Admin
        admin_id = uuid.uuid4()
        admin = User(
            id=admin_id,
            email="admin@samarpan.org",
            hashed_password=get_password_hash("password123"),
            full_name="Samarpan Executive Admin",
            role=UserRoleEnum.SUPER_ADMIN,
            is_verified=True,
            is_active=True
        )
        # 2. NGO Admin / Coordinator
        ngo_id = uuid.uuid4()
        ngo_user = User(
            id=ngo_id,
            email="coordinator@samarpan.org",
            hashed_password=get_password_hash("password123"),
            full_name="Priya Sharma (NGO Director)",
            role=UserRoleEnum.CAMPAIGN_MANAGER,
            is_verified=True,
            is_active=True
        )
        # 3. Volunteer 1 (Expert First Responder)
        v1_id = uuid.uuid4()
        vol_user_1 = User(
            id=v1_id,
            email="volunteer.rahul@samarpan.org",
            hashed_password=get_password_hash("password123"),
            full_name="Rahul Dev",
            role=UserRoleEnum.VOLUNTEER,
            is_verified=True,
            is_active=True
        )
        # 4. Volunteer 2 (Tech Coordinator)
        v2_id = uuid.uuid4()
        vol_user_2 = User(
            id=v2_id,
            email="volunteer.amit@samarpan.org",
            hashed_password=get_password_hash("password123"),
            full_name="Amit Roy",
            role=UserRoleEnum.VOLUNTEER,
            is_verified=True,
            is_active=True
        )
        # 5. Elite Donor
        donor_id = uuid.uuid4()
        donor_user = User(
            id=donor_id,
            email="donor.karan@gmail.com",
            hashed_password=get_password_hash("password123"),
            full_name="Karan Malhotra (Impact Investor)",
            role=UserRoleEnum.DONOR,
            is_verified=True,
            is_active=True
        )
        # 6. Community Member
        comm_id = uuid.uuid4()
        comm_user = User(
            id=comm_id,
            email="neha.patel@outlook.com",
            hashed_password=get_password_hash("password123"),
            full_name="Neha Patel",
            role=UserRoleEnum.DONOR,
            is_verified=True,
            is_active=True
        )

        db.add_all([admin, ngo_user, vol_user_1, vol_user_2, donor_user, comm_user])
        await db.flush()

        print("--- STEP 2: SEEDING CAMPAIGNS (8+ HIGH-IMPACT STORYLINES) ---")
        c1 = Campaign(
            id=uuid.uuid4(),
            title="Assam Flood SOS: Saving Lives, Serving Hope",
            slug="flood-relief-assam",
            description="Assam is facing critical flooding, and we are stepping up. We are deploying rapid rescue boats, fresh hot meals, clean water channels, and emergency medical kits directly to submerged villages. This isn't just relief; it's a lifeline. Be the hero they need—let's make a real difference, together.",
            goal_amount=1500000,
            raised_amount=880000,
            category="Disaster Relief",
            location="Assam, India",
            cover_image="/images/flood_relief_assam.png",
            is_emergency=True,
            created_by=admin_id
        )
        c2 = Campaign(
            id=uuid.uuid4(),
            title="Project Tej: Empowering 1000 Rural Girls",
            slug="education-rural-girls",
            description="We are here to change the narrative. Sponsoring education, premium learning kits, digital tabs, and smart school uniforms for 1000 underprivileged girls in rural Rajasthan. Education is the ultimate flex—let's empower the next generation of leaders and creators to shine bright.",
            goal_amount=2000000,
            raised_amount=1350000,
            category="Education",
            location="Rajasthan, India",
            cover_image="/images/rural_girls_education.png",
            is_emergency=False,
            created_by=admin_id
        )
        c3 = Campaign(
            id=uuid.uuid4(),
            title="Green Heart: Planting 10,000 Native Trees",
            slug="green-heart-mumbai",
            description="Time to heal the planet. We are launching a massive urban afforestation drive in Mumbai's green belt to restore biodiversity, fight air pollution, and cool down the concrete jungle. Planting a tree is a love letter to the future—join our eco-revolution and make the world green again.",
            goal_amount=800000,
            raised_amount=320000,
            category="Environment",
            location="Mumbai, India",
            cover_image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013",
            is_emergency=False,
            created_by=ngo_id
        )
        c4 = Campaign(
            id=uuid.uuid4(),
            title="Project Swasthya: Rural Mobile Medical Clinics",
            slug="rural-mobile-clinics",
            description="Quality healthcare should never be a luxury. We are deploying fully equipped mobile clinic vans with free doctor consultations, diagnostic tests, and critical medicines directly to remote tribal villages. Delivering radical empathy and clinical excellence right to their doorsteps.",
            goal_amount=2500000,
            raised_amount=1890000,
            category="Health",
            location="Maharashtra, India",
            cover_image="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=2070",
            is_emergency=False,
            created_by=ngo_id
        )
        c5 = Campaign(
            id=uuid.uuid4(),
            title="Clean Flow: Solar-Powered Water Purification",
            slug="clean-flow-solar-water",
            description="Access to water is a human right. We are installing heavy-duty solar-powered filtration kiosks in arsenic-affected rural sectors of Bihar, delivering 5,000 liters of pure, safe drinking water daily to eliminate waterborne diseases. Let's build a clean, sustainable future.",
            goal_amount=1200000,
            raised_amount=950000,
            category="Environment",
            location="Bihar, India",
            cover_image="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070",
            is_emergency=False,
            created_by=admin_id
        )
        c6 = Campaign(
            id=uuid.uuid4(),
            title="Project Poshan: Eliminating Child Malnutrition",
            slug="project-poshan-nutrition",
            description="No child should sleep hungry. Sponsoring monthly supply grids of high-protein micro-nutrient meals, health monitoring, and infant care counseling for 500 under-five children in urban slum segments of Madhya Pradesh. Serving major health upgrades.",
            goal_amount=1000000,
            raised_amount=450000,
            category="Health",
            location="Madhya Pradesh, India",
            cover_image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070",
            is_emergency=True,
            created_by=ngo_id
        )
        c7 = Campaign(
            id=uuid.uuid4(),
            title="Digital Wings: Coding Bootcamps for Underprivileged Youth",
            slug="digital-wings-coding-bootcamps",
            description="Empowering the youth with digital sovereignty. Launching state-of-the-art coding and software engineering hubs equipped with laptops, high-speed internet, and expert tech mentors for youth in tier-3 cities to unlock global tech careers. Tech education is the ultimate flex.",
            goal_amount=1800000,
            raised_amount=1520000,
            category="Education",
            location="Karnataka, India",
            cover_image="https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020",
            is_emergency=False,
            created_by=admin_id
        )
        c8 = Campaign(
            id=uuid.uuid4(),
            title="Animal Safe: Wildlife Emergency Rescue Grid",
            slug="wildlife-emergency-rescue-grid",
            description="Protecting the vulnerable wild. Building an automated, rapid-response medical grid for injured wildlife, birds, and stray animals in forest peripheral sectors. Setting up animal ICU ambulances and dynamic rescue squads.",
            goal_amount=600000,
            raised_amount=120000,
            category="Disaster Relief",
            location="Uttarakhand, India",
            cover_image="https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=2000",
            is_emergency=False,
            created_by=ngo_id
        )

        db.add_all([c1, c2, c3, c4, c5, c6, c7, c8])
        await db.flush()

        print("--- STEP 3: SEEDING CAMPAIGN DONATIONS & RECURRING PLEDGES ---")
        # 1. Direct Completed Donations
        d1 = Donation(
            id=uuid.uuid4(),
            donor_id=donor_id,
            campaign_id=c1.id,
            amount=500000.0,
            currency="INR",
            status=DonationStatus.COMPLETED,
            is_anonymous=False,
            payment_method="UPI",
            transaction_id="TXN-" + str(uuid.uuid4())[:8].upper(),
            donor_name="Karan Malhotra",
            donor_email="donor.karan@gmail.com",
            message="We stand strong with Assam. Keep up the high-energy rescue dispatch work!"
        )
        d2 = Donation(
            id=uuid.uuid4(),
            donor_id=donor_id,
            campaign_id=c2.id,
            amount=300000.0,
            currency="INR",
            status=DonationStatus.COMPLETED,
            is_anonymous=False,
            payment_method="NetBanking",
            transaction_id="TXN-" + str(uuid.uuid4())[:8].upper(),
            donor_name="Karan Malhotra",
            donor_email="donor.karan@gmail.com",
            message="Empowering rural girls with software tools and books is the absolute ultimate flex!"
        )
        d3 = Donation(
            id=uuid.uuid4(),
            donor_id=comm_id,
            campaign_id=c3.id,
            amount=15000.0,
            currency="INR",
            status=DonationStatus.COMPLETED,
            is_anonymous=False,
            payment_method="Card",
            transaction_id="TXN-" + str(uuid.uuid4())[:8].upper(),
            donor_name="Neha Patel",
            donor_email="neha.patel@outlook.com",
            message="Small contribution to support Juhu's green forest cover project!"
        )
        d4 = Donation(
            id=uuid.uuid4(),
            donor_id=None,  # Anonymous Donor
            campaign_id=c4.id,
            amount=200000.0,
            currency="INR",
            status=DonationStatus.COMPLETED,
            is_anonymous=True,
            payment_method="UPI",
            transaction_id="TXN-" + str(uuid.uuid4())[:8].upper(),
            donor_name="Anonymous Donor",
            donor_email="anonymous@hidden.com",
            message="Healthcare access directly in remote hills is extremely crucial. Supporting."
        )
        d5 = Donation(
            id=uuid.uuid4(),
            donor_id=None,
            campaign_id=c7.id,
            amount=45000.0,
            currency="INR",
            status=DonationStatus.COMPLETED,
            is_anonymous=True,
            payment_method="UPI",
            transaction_id="TXN-" + str(uuid.uuid4())[:8].upper(),
            donor_name="Anonymous Tech Donor",
            donor_email="anonymous.tech@hidden.com",
            message="Tech bootcamps change lifetimes. Rooting for these young developers!"
        )

        db.add_all([d1, d2, d3, d4, d5])

        # 2. Recurring Pledges
        rd1 = RecurringDonation(
            id=uuid.uuid4(),
            donor_id=donor_id,
            campaign_id=c4.id,
            amount=50000.0,
            currency="INR",
            frequency="monthly",
            is_active=True,
            next_billing_date=datetime.now(timezone.utc) + timedelta(days=30)
        )
        rd2 = RecurringDonation(
            id=uuid.uuid4(),
            donor_id=donor_id,
            campaign_id=c7.id,
            amount=25000.0,
            currency="INR",
            frequency="monthly",
            is_active=True,
            next_billing_date=datetime.now(timezone.utc) + timedelta(days=30)
        )
        db.add_all([rd1, rd2])

        print("--- STEP 4: SEEDING ACTIVE FORUM THREADS & NESTED COMMENTS (8+ THREADS) ---")
        t1 = ForumThread(
            id=uuid.uuid4(),
            title="Best ways to purify water in remote camps? Real talk only!",
            content="Hey team! Heading out to a remote disaster relief zone next week. I need the absolute best, most scalable ways to purify drinking water on a budget. What are your tried-and-tested hacks? Let's discuss and share the knowledge!",
            author_id=v1_id,
            category="Health"
        )
        t2 = ForumThread(
            id=uuid.uuid4(),
            title="Mumbai Beach Cleanup Drive: Who is with us? Let's show up!",
            content="We are organizing a massive beach cleanup this weekend at Juhu Beach to reclaim our shorelines from plastic pollution. We'll provide gloves, trash bags, music, and energy drinks. Bring your friends and let's serve major eco-conscious energy!",
            author_id=v2_id,
            category="Environment"
        )
        t3 = ForumThread(
            id=uuid.uuid4(),
            title="AI Matchmaking for Volunteers: How are you vibing with it?",
            content="Just tried the new AI volunteer matchmaking dashboard and it paired me with the rural primary teaching camp perfectly! The matching logic is absolute genius. How has your experience been? Let us know if you have suggestions to improve the flow!",
            author_id=admin_id,
            category="Education"
        )
        t4 = ForumThread(
            id=uuid.uuid4(),
            title="Deploying emergency communications during cell tower failures?",
            content="During severe floods, conventional cellular network grids go completely dead. What is the consensus on utilizing LoRaWAN mesh networks or low-altitude portable repeaters to handle emergency SOS dispatches? Would love insights from systems engineers!",
            author_id=vol_user_2.id,
            category="Logistics"
        )
        t5 = ForumThread(
            id=uuid.uuid4(),
            title="Organizing primary schools under single-tree setups in tribal sectors",
            content="We are planning to set up outdoor primary learning units in tribal hamlets where building infrastructure is zero. What are the best weatherproofing strategies for digital smart tabs and learning kits? Highly open to advice!",
            author_id=ngo_id,
            category="Education"
        )
        t6 = ForumThread(
            id=uuid.uuid4(),
            title="How to manage high-flow clean water storage to prevent re-contamination?",
            content="We've successfully installed water purification kiosks, but local storage units are prone to external impurities. Should we implement localized UV loop reactors or basic closed-loop food-grade storage systems? Let's talk tech specifications.",
            author_id=comm_id,
            category="Health"
        )
        t7 = ForumThread(
            id=uuid.uuid4(),
            title="Eco-friendly packaging alternatives for rapid food relief kits?",
            content="Plastics are a absolute menace, especially when dropping food supplies during emergencies. Has anyone experimented with high-tensile biodegradable seaweed packaging or compressed bamboo fibers for ration delivery kits? Let's share alternatives.",
            author_id=v1_id,
            category="Environment"
        )
        t8 = ForumThread(
            id=uuid.uuid4(),
            title="Unlocking micro-financing for rural women artisans - Best approaches?",
            content="Empowering local crafts creators is a major flex. We want to structure a transparent, peer-to-peer micro-finance pipeline directly visible on the transparency ledger. How can we verify transaction flows while maintaining local simplicity?",
            author_id=donor_id,
            category="Logistics"
        )

        db.add_all([t1, t2, t3, t4, t5, t6, t7, t8])
        await db.flush()

        # Seed Nested Forum Comments to simulate actual user discussions!
        tc1 = ForumComment(id=uuid.uuid4(), thread_id=t1.id, author_id=admin_id, content="Implementing high-surface gravity ceramic candles combined with solar pasteurization is highly scalable and costs nearly zero in maintenance. Verified in secondary response camps!")
        tc2 = ForumComment(id=uuid.uuid4(), thread_id=t1.id, author_id=v1_id, content="Yes, absolutely agree! Solar pasteurization is the main character hack here. We also added closed-loop charcoal filters to eliminate residual odors successfully.")
        tc3 = ForumComment(id=uuid.uuid4(), thread_id=t2.id, author_id=comm_id, content="Vibes are off the charts! Count me and three of my roommates in. We'll be bringing extra reusable mesh bags for sorting recyclables.")
        tc4 = ForumComment(id=uuid.uuid4(), thread_id=t2.id, author_id=v2_id, content="Excellent! Look out for the glowing gold Samarpan canopy near the main entrance. Warm snacks are on us!")
        tc5 = ForumComment(id=uuid.uuid4(), thread_id=t4.id, author_id=v2_id, content="We actively utilized Meshtastic-powered LoRa nodes during the Bihar trial runs. It operates flawlessly over a 5km radius with near-zero energy consumption. Strongly recommend it!")
        tc6 = ForumComment(id=uuid.uuid4(), thread_id=t5.id, author_id=donor_id, content="I would love to fund a set of ruggedized solar-charging briefcases that hold and charge 10 smart tabs simultaneously. Reach out to coordinate delivery parameters!")

        db.add_all([tc1, tc2, tc3, tc4, tc5, tc6])

        print("--- STEP 5: SEEDING DISASTER EMERGENCY SOS ALERTS (5+ ACTIVE ALERTS) ---")
        ea1 = EmergencyAlert(
            id=uuid.uuid4(),
            title="CRITICAL: Severe Flooding - Kaziranga Region",
            description="Evacuations are active. We need immediate volunteer rescue squads, inflatable motorboats, clean drinking water tanks, and first aid packages. Act now to save lives.",
            severity="Critical",
            location="Kaziranga, Assam",
            is_active=True,
            created_by=admin_id
        )
        ea2 = EmergencyAlert(
            id=uuid.uuid4(),
            title="ALERT: Heatwave Advisory & Medical Response",
            description="Severe heatwave warning across rural Rajasthan. We are setting up hydration booths and deploying mobile cooling dispatches to protect vulnerable communities.",
            severity="Medium",
            location="Western Rajasthan",
            is_active=True,
            created_by=admin_id
        )
        ea3 = EmergencyAlert(
            id=uuid.uuid4(),
            title="CRITICAL: Landslide Blockade - Himalayan Passes",
            description="A sudden landslide has blocked critical connection roads. Local settlements are cutoff from food supply hubs. Deploying rapid air-drop food units and emergency logistics squads.",
            severity="Critical",
            location="Joshimath, Uttarakhand",
            is_active=True,
            created_by=ngo_id
        )
        ea4 = EmergencyAlert(
            id=uuid.uuid4(),
            title="ALERT: Cyclonic Storm Inflow Response",
            description="Severe coastal cyclone incoming. Setting up cyclone rescue hubs and distributing battery packs, emergency flashlights, and dry food rations.",
            severity="High",
            location="Sundarbans, West Bengal",
            is_active=True,
            created_by=admin_id
        )
        ea5 = EmergencyAlert(
            id=uuid.uuid4(),
            title="ALERT: Industrial Water Contamination Crisis",
            description="Runoff has contaminated local primary wells. We need emergency water tankers and water treatment dispatches to the affected blocks immediately.",
            severity="High",
            location="Ennore, Tamil Nadu",
            is_active=True,
            created_by=ngo_id
        )

        db.add_all([ea1, ea2, ea3, ea4, ea5])

        print("--- STEP 6: SEEDING AUDITED TRANSPARENCY LOGS (8+ LEDGER RECORDS) ---")
        t_log1 = TransparencyLog(
            id=uuid.uuid4(),
            type="Disaster Relief",
            amount="4,50,000",
            description="Directly purchased and distributed 20 heavy-duty inflatable rescue boats, 500 dry ration food packs, and 200 emergency water filtration units for the Assam Flood Relief camps. Verified by real-time blockchain-authenticated ledger records.",
            reference_id="REF-FLOOD-001"
        )
        t_log2 = TransparencyLog(
            id=uuid.uuid4(),
            type="Education",
            amount="2,50,000",
            description="Distributed 1000 learning kits containing textbooks, notebooks, writing materials, and 50 solar study lamps for underprivileged girls in rural Rajasthan to empower remote studying.",
            reference_id="REF-EDU-002"
        )
        t_log3 = TransparencyLog(
            id=uuid.uuid4(),
            type="Healthcare",
            amount="1,20,000",
            description="Procured premium diagnostic tools, primary care kits, and critical chronic disease medicines distributed during our Project Swasthya tribal medical camp.",
            reference_id="REF-HEALTH-003"
        )
        t_log4 = TransparencyLog(
            id=uuid.uuid4(),
            type="Environment",
            amount="80,000",
            description="Purchased 5,000 high-grade native tree saplings, premium organic manure, and protective fences for our afforestation project in Mumbai.",
            reference_id="REF-ENV-004"
        )
        t_log5 = TransparencyLog(
            id=uuid.uuid4(),
            type="Environment",
            amount="3,80,000",
            description="Purchased and installed 8 heavy-duty solar water purification kiosks in rural Bihar blocks, including underground pipelines and concrete bases.",
            reference_id="REF-WAT-005"
        )
        t_log6 = TransparencyLog(
            id=uuid.uuid4(),
            type="Healthcare",
            amount="1,90,000",
            description="Direct procurement of high-protein micro-nutrient meals and dynamic medical monitoring charts for slums in Madhya Pradesh.",
            reference_id="REF-NUT-006"
        )
        t_log7 = TransparencyLog(
            id=uuid.uuid4(),
            type="Education",
            amount="5,20,000",
            description="Procured 20 commercial-grade laptops, high-definition classroom projectors, and high-flow Wi-Fi routers for tiers-3 tech camps.",
            reference_id="REF-TECH-007"
        )
        t_log8 = TransparencyLog(
            id=uuid.uuid4(),
            type="Disaster Relief",
            amount="95,000",
            description="Setup animal containment ICU enclosures and animal ambulances equipped with wildlife medicine kits in forest buffer segments.",
            reference_id="REF-WILD-008"
        )

        db.add_all([t_log1, t_log2, t_log3, t_log4, t_log5, t_log6, t_log7, t_log8])

        print("--- STEP 7: SEEDING ECOSYSTEM EVENTS (5+ DYNAMIC GATHERINGS) ---")
        ev1 = Event(
            id=uuid.uuid4(),
            title="Mumbai Beach Cleanup & Reclaim Drive",
            slug="mumbai-beach-cleanup-drive",
            description="Reclaim our shores! We are gathering at Juhu Beach to collect marine waste, catalog plastic pollution types, and create awareness about ecological health. All gear provided, alongside organic snacks and positive vibes. Let's make an impact!",
            category="Environment",
            location="Juhu Beach, Mumbai",
            start_date=datetime.now(timezone.utc) + timedelta(days=2),
            max_attendees=150,
            created_by=admin_id
        )
        ev2 = Event(
            id=uuid.uuid4(),
            title="Primary Healthcare: Digital Community Seminar",
            slug="primary-healthcare-awareness-seminar",
            description="Join our global medical experts online for a seminar focused on rural healthcare frameworks, basic wellness protocols, and emergency medical diagnostics. Streamed live to community centers worldwide.",
            category="Health",
            location="Online Livestream",
            start_date=datetime.now(timezone.utc) + timedelta(days=5),
            max_attendees=500,
            is_online=True,
            livestream_url="https://youtube.com/live/samarpan-health",
            created_by=admin_id
        )
        ev3 = Event(
            id=uuid.uuid4(),
            title="Assam Emergency Relief Volunteer Briefing",
            slug="assam-flood-volunteer-briefing",
            description="Urgent briefing for all registered field volunteers. We will coordinate motorboat distribution paths, food packaging hubs, and emergency medical triage protocols.",
            category="Logistics",
            location="Disaster Relief HQ, Guwahati",
            start_date=datetime.now(timezone.utc) + timedelta(days=1),
            max_attendees=100,
            created_by=ngo_id
        )
        ev4 = Event(
            id=uuid.uuid4(),
            title="Tech for Good: Smart Coding Hackathon",
            slug="tech-for-good-smart-coding-hackathon",
            description="Mobilizing all software builders, systems engineers, and designers. We are coding open-source offline-first mesh dispatches and transparency dashboards to empower local humanitarian networks.",
            category="Education",
            location="Tech Hub, Bangalore",
            start_date=datetime.now(timezone.utc) + timedelta(days=10),
            max_attendees=250,
            created_by=admin_id
        )
        ev5 = Event(
            id=uuid.uuid4(),
            title="Eco afforestation & Soil Health Seminar",
            slug="eco-afforestation-soil-health",
            description="Learn how to restore native urban forests utilizing the Miyawaki technique. Includes hands-on tree planting, soil conditioning workshops, and micro-ecosystem designs.",
            category="Environment",
            location="Sanjay Gandhi National Park, Mumbai",
            start_date=datetime.now(timezone.utc) + timedelta(days=4),
            max_attendees=80,
            created_by=ngo_id
        )

        db.add_all([ev1, ev2, ev3, ev4, ev5])

        print("--- STEP 8: SEEDING ECOSYSTEM RESOURCE TRACKING ---")
        rt1 = ResourceTracking(
            id=uuid.uuid4(),
            name="Inflatable Rescue Boats",
            type="Logistics & Transport",
            quantity="20",
            unit="units",
            location="Assam Relief Depot, Guwahati",
            status="deployed"
        )
        rt2 = ResourceTracking(
            id=uuid.uuid4(),
            name="Solar Clean Kiosks",
            type="Water Infrastructure",
            quantity="8",
            unit="installations",
            location="North Bihar Water Hubs",
            status="operational"
        )
        rt3 = ResourceTracking(
            id=uuid.uuid4(),
            name="Rugged Smart Study Tabs",
            type="Digital Assets",
            quantity="120",
            unit="devices",
            location="Rajasthan Girls Center, Jaipur",
            status="allocated"
        )
        rt4 = ResourceTracking(
            id=uuid.uuid4(),
            name="Mobile Emergency Clinic Vans",
            type="Medical Infrastructure",
            quantity="3",
            unit="vehicles",
            location="Sanjay Gandhi Tribal Outposts",
            status="active"
        )
        db.add_all([rt1, rt2, rt3, rt4])

        print("--- STEP 9: SEEDING BLOG ARTICLES & PUBLICATIONS (5+ CINEMATIC POSTS) ---")
        b1 = Blog(
            id=uuid.uuid4(),
            title="How AI Matchmaking is Revolutionizing Grassroots Dispatches",
            slug="ai-revolution-grassroots-dispatches",
            content="Humanitarian relief is entering a major era of hyper-efficiency. Traditional disaster management networks are notorious for high latencies and logistical logjams. With custom AI resource allocation algorithms on the ground, we can now map critical skills (like search-and-rescue, trauma counseling, and high-flow water purification) to active SOS dispatches in under 12 seconds. It is the ultimate tech flex—serving hope at the speed of light.",
            excerpt="Discover how advanced neural matchmaking systems match volunteers to emergency coordinates in under 12 seconds.",
            cover_image="/images/hero_background.png",
            category="Technology",
            tags=["AI", "Disaster Relief", "TechForGood"],
            author_id=admin_id,
            is_published=True,
            is_featured=True,
            view_count=340,
            ai_summary="AI matching algorithms reduce humanitarian dispatch latencies from days to seconds by analyzing skill networks dynamically."
        )
        b2 = Blog(
            id=uuid.uuid4(),
            title="Shattering traditional charity gatekeepers via radical ledgers",
            slug="shattering-charity-gatekeepers-radical-ledgers",
            content="Let's be real: people want to know exactly where their energy and hard-earned capital lands. The old model of sending money into a black box and hoping for a yearly PDF brochure is officially over. We are serving radical, blockchain-aligned, audited transparency where every rupee is tracked. When you donate, you unlock immediate logs showing real-time deliveries. Main character accountability is the standard.",
            excerpt="No gatekeepers. Just direct, auditable impact. Here is how we verify every rupee in real time.",
            cover_image="/images/story_illustration.png",
            category="Transparency",
            tags=["Fintech", "Accountability", "Grassroots"],
            author_id=admin_id,
            is_published=True,
            is_featured=False,
            view_count=185,
            ai_summary="Direct accountability replaces traditional yearly charity reports with instant, micro-level ledger updates."
        )
        b3 = Blog(
            id=uuid.uuid4(),
            title="Empowering the borderless community through digital teaching hubs",
            slug="empowering-borderless-community-teaching-hubs",
            content="Education is not just about memorizing facts; it's about building sovereignty. By establishing offline-first digital learning kiosks in Rajasthan and Karnataka, we are proving that geography is no longer a barrier to top-tier learning. Young girls are mastering coding paradigms and digital creative arts using local solar power grids. The era of digital wings has officially begun.",
            excerpt="Step inside our borderless, solar-powered teaching kiosks rewriting rural educational models.",
            cover_image="/images/rural_girls_education.png",
            category="Education",
            tags=["Education", "Sovereignty", "Grassroots"],
            author_id=ngo_id,
            is_published=True,
            is_featured=False,
            view_count=210,
            ai_summary="Solar-powered smart kiosks enable underprivileged children to access global curriculum streams dynamically."
        )
        b4 = Blog(
            id=uuid.uuid4(),
            title="Miyawaki afforestation: Cool down our cities organically",
            slug="miyawaki-afforestation-cool-cities",
            content="Urban heat islands are a massive threat to public health. Heavy concrete blocks trapping solar heat increase city temperatures by up to 5 degrees. The Miyawaki method solves this by creating hyper-dense, multi-layered native forest loops that grow 10x faster and absorb 30x more carbon. We are planting native trees across Mumbai's peripheral zones to establish robust green hearts.",
            excerpt="How planting native urban mini-forests can cool down our hot concrete jungles in under two years.",
            cover_image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013",
            category="Environment",
            tags=["ClimateAction", "Miyawaki", "UrbanForest"],
            author_id=ngo_id,
            is_published=True,
            is_featured=True,
            view_count=420,
            ai_summary="Densely packed multi-tier afforestation micro-ecosystems significantly cool concrete urban centers."
        )
        b5 = Blog(
            id=uuid.uuid4(),
            title="The clinical design of a mobile medical response fleet",
            slug="clinical-design-mobile-medical-response",
            content="Setting up healthcare clinics in rural tribal hubs is a unique engineering challenge. Traditional brick-and-mortar hospitals are costly and logistically complex to maintain. Our Project Swasthya clinics solve this by packaging complete clinical setups—diagnostic machines, remote consultation screens, and cold-chain medicine safes—directly inside heavy-duty offroad utility vans. Empathy on wheels.",
            excerpt="Step inside our heavy-duty clinical mobile vans bringing emergency care to remote tribal hamlets.",
            cover_image="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=2070",
            category="Healthcare",
            tags=["HealthTech", "Logistics", "Empathy"],
            author_id=admin_id,
            is_published=True,
            is_featured=False,
            view_count=198,
            ai_summary="Self-contained offroad clinical vans successfully resolve traditional medical accessibility constraints."
        )

        db.add_all([b1, b2, b3, b4, b5])
        await db.flush()

        # Seed Blog Comments
        bc1 = BlogComment(id=uuid.uuid4(), blog_id=b1.id, author_id=v2_id, content="This is pure systems excellence. The AI dispatcher completely transforms rescue coordinate mappings!")
        bc2 = BlogComment(id=uuid.uuid4(), blog_id=b2.id, author_id=donor_id, content="Finally, a platform that respects donor intelligence with actual ledger updates instead of standard PR brochures.")
        db.add_all([bc1, bc2])

        print("--- STEP 10: SEEDING VOLUNTEER PROFILES, HOUR LOGS, SKILLS & BADGES ---")
        # Profile for Volunteer Rahul
        v_id_1 = uuid.uuid4()
        vol_1 = Volunteer(
            id=v_id_1,
            user_id=v1_id,
            is_verified=True,
            verification_status="verified",
            availability={"days": ["Saturday", "Sunday"], "hours": "10-15 hrs/week"},
            total_hours=85.5,
            reputation_points=950
        )
        # Profile for Volunteer Amit
        v_id_2 = uuid.uuid4()
        vol_2 = Volunteer(
            id=v_id_2,
            user_id=v2_id,
            is_verified=True,
            verification_status="verified",
            availability={"days": ["Monday", "Wednesday", "Friday"], "hours": "5-10 hrs/week"},
            total_hours=42.0,
            reputation_points=620
        )

        db.add_all([vol_1, vol_2])
        await db.flush()

        # Skills for Rahul
        vs1 = VolunteerSkill(id=uuid.uuid4(), volunteer_id=v_id_1, skill="Disaster Management", level="expert")
        vs2 = VolunteerSkill(id=uuid.uuid4(), volunteer_id=v_id_1, skill="Water Purification", level="intermediate")
        vs3 = VolunteerSkill(id=uuid.uuid4(), volunteer_id=v_id_1, skill="Smart Logistics", level="expert")
        # Skills for Amit
        vs4 = VolunteerSkill(id=uuid.uuid4(), volunteer_id=v_id_2, skill="Meshtastic Systems", level="expert")
        vs5 = VolunteerSkill(id=uuid.uuid4(), volunteer_id=v_id_2, skill="Full-Stack Dev", level="expert")
        vs6 = VolunteerSkill(id=uuid.uuid4(), volunteer_id=v_id_2, skill="UX Design", level="intermediate")

        db.add_all([vs1, vs2, vs3, vs4, vs5, vs6])

        # Hours logged for Rahul
        vh1 = VolunteerHours(
            id=uuid.uuid4(),
            volunteer_id=v_id_1,
            campaign_id=c1.id,
            hours=45.0,
            description="Steered inflatable rescue dispatches and food distribution during first-wave flooding."
        )
        vh2 = VolunteerHours(
            id=uuid.uuid4(),
            volunteer_id=v_id_1,
            event_id=ev1.id,
            hours=12.5,
            description="Coordinated clean-up logistics and recycled waste cataloging squads at Juhu beach."
        )
        # Hours logged for Amit
        vh3 = VolunteerHours(
            id=uuid.uuid4(),
            volunteer_id=v_id_2,
            event_id=ev4.id,
            hours=30.0,
            description="Engineered the offline-first mesh communications dispatch system during the Tech Hackathon."
        )

        db.add_all([vh1, vh2, vh3])

        # Badges for Rahul
        vb1 = VolunteerBadge(
            id=uuid.uuid4(),
            volunteer_id=v_id_1,
            badge_name="First Responder Champion",
            badge_icon="ShieldAlert",
            description="Awarded for logging 40+ hours in active emergency SOS campaigns."
        )
        vb2 = VolunteerBadge(
            id=uuid.uuid4(),
            volunteer_id=v_id_1,
            badge_name="Eco Warrior",
            badge_icon="Leaf",
            description="Awarded for steering coastal cleanups and carbon capture events."
        )
        # Badges for Amit
        vb3 = VolunteerBadge(
            id=uuid.uuid4(),
            volunteer_id=v_id_2,
            badge_name="Systems Architect Elite",
            badge_icon="Cpu",
            description="Awarded for deploying secure mesh communication nodes under zero grid connectivity."
        )

        db.add_all([vb1, vb2, vb3])

        print("--- STEP 11: SEEDING REAL-TIME USER NOTIFICATIONS ---")
        # Notifications for Rahul (Volunteer)
        n1 = Notification(
            id=uuid.uuid4(),
            user_id=v1_id,
            title="AI Matching Complete! 🚀",
            body="Your credentials matched with the critical Assam Floods relief dispatch. Join the active rescue boat squads now!",
            type="ai",
            entity_id=str(c1.id),
            entity_type="campaign",
            is_read=False
        )
        n2 = Notification(
            id=uuid.uuid4(),
            user_id=v1_id,
            title="CRITICAL SOS: Inflatable Boats Needed!",
            body="Kaziranga block is flooded by 1.2 meters. Emergency teams need immediate inflatable vessel logistics steering.",
            type="sos",
            entity_id=str(ea1.id),
            entity_type="emergency",
            is_read=False
        )
        # Notifications for Priya Sharma (NGO Coordinator)
        n3 = Notification(
            id=uuid.uuid4(),
            user_id=ngo_id,
            title="New Donation Received! ❤️",
            body="Karan Malhotra just donated INR 3,00,000 to Project Tej (Rajasthan Girls Education). Impact is ready to scale!",
            type="donation",
            entity_id=str(d2.id),
            entity_type="donation",
            is_read=False
        )
        n4 = Notification(
            id=uuid.uuid4(),
            user_id=ngo_id,
            title="Volunteer RSVP: Mumbai Beach Cleanup",
            body="Volunteer Rahul Dev just submitted an RSVP check-in for the coastal cleanup event. Roster successfully updated.",
            type="event",
            entity_id=str(ev1.id),
            entity_type="event",
            is_read=True
        )

        db.add_all([n1, n2, n3, n4])

        await db.commit()
        print("\n=======================================================")
        print("DATABASE MASTER SEED COMPLETED SUCCESSFULLY! SUCCESS")
        print("All sections, nested forum dispatches, blogs, emergency dispatches,")
        print("volunteer hours matrices, and transparency log files are active.")
        print("=======================================================")

if __name__ == "__main__":
    asyncio.run(seed_data())
