
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEAM_MEMBERS = [
    { name: 'Kai Tanaka', email: 'kai.t@example.com', role: 'lead', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai' },
    { name: 'Elara Vance', email: 'elara.v@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elara' },
    { name: 'Marcus Jenson', email: 'marcus.j@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { name: 'Priya Patel', email: 'priya.p@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { name: 'Jordan Hayes', email: 'jordan.h@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
    { name: 'Nina Rodriguez', email: 'nina.r@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' },
    { name: 'Liam O’Connor', email: 'liam.o@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
    { name: 'Sophie Chen', email: 'sophie.c@example.com', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie' },
];

const AGREEMENTS = [
    { title: 'Core Working Hours', description: 'We agree to be online and responsive between 10 AM and 3 PM EST.', status: 'active' },
    { title: 'Code Review Response Time', description: 'PRs should be reviewed within 24 hours of posting.', status: 'active' },
    { title: 'No Meeting Fridays', description: 'Fridays are preserved for deep work; no scheduled internal meetings.', status: 'active' },
    { title: 'Documentation First', description: 'All new features must include documentation before merging.', status: 'pending' },
    { title: 'Slack Availability Status', description: 'Update Slack status when OOO or in deep work mode.', status: 'active' },
];

const DELIVERABLE_TEMPLATES = [
    { title: 'Q3 Financial Report', status: 'completed' },
    { title: 'Mobile App Redesign', status: 'in-progress' },
    { title: 'API Migration', status: 'at-risk' },
    { title: 'User Onboarding Flow', status: 'in-progress' },
    { title: 'Marketing Campaign Launch', status: 'upcoming' },
    { title: 'Security Audit', status: 'completed' },
    { title: 'Database Optimization', status: 'in-progress' },
    { title: 'Customer Feedback System', status: 'upcoming' },
    { title: 'Internal Tools Dashboard', status: 'at-risk' },
    { title: 'Website Accessibility Fixes', status: 'completed' },
    { title: 'Analytics Dashboard', status: 'in-progress' },
    { title: 'Payment Gateway Integration', status: 'upcoming' },
];

async function seed() {
    console.log('🌱 Starting database seed...');

    // 1. Clear existing data
    console.log('🧹 Clearing existing data...');
    const tables = ['update_reactions', 'updates', 'deliverable_dependencies', 'deliverables', 'agreement_signatures', 'agreements', 'team_members'];

    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        if (error) console.error(`Error clearing ${table}:`, error.message);
    }

    // 2. Insert Team Members
    console.log('👥 Inserting team members...');
    const { data: members, error: membersError } = await supabase
        .from('team_members')
        .insert(TEAM_MEMBERS)
        .select();

    if (membersError) throw new Error(`Failed to insert members: ${membersError.message}`);
    if (!members) throw new Error('No members returned');

    // 3. Insert Agreements & Signatures
    console.log('📜 Inserting agreements...');
    const { data: agreements, error: agreementsError } = await supabase
        .from('agreements')
        .insert(AGREEMENTS.map(a => ({ ...a, created_by: members[0].id })))
        .select();

    if (agreementsError) throw new Error(`Failed to insert agreements: ${agreementsError.message}`);
    if (!agreements) throw new Error('No agreements returned');

    // Randomly sign agreements
    console.log('✍️  Signing agreements...');
    const signatures = [];
    for (const agreement of agreements) {
        if (agreement.status === 'active') {
            // 80-100% signing rate for active agreements
            for (const member of members) {
                if (Math.random() > 0.1) {
                    signatures.push({ agreement_id: agreement.id, member_id: member.id });
                }
            }
        } else {
            // 20-50% signing rate for pending
            for (const member of members) {
                if (Math.random() > 0.6) {
                    signatures.push({ agreement_id: agreement.id, member_id: member.id });
                }
            }
        }
    }
    await supabase.from('agreement_signatures').insert(signatures);

    // 4. Insert Deliverables
    console.log('📦 Inserting deliverables...');
    const deliverablesPayload = [];
    for (let i = 0; i < 30; i++) { // Generate 30 tasks
        const template = DELIVERABLE_TEMPLATES[Math.floor(Math.random() * DELIVERABLE_TEMPLATES.length)];
        const owner = members[Math.floor(Math.random() * members.length)];

        // Randomize status based on template bias but add variety
        const statuses = ['completed', 'in-progress', 'at-risk', 'upcoming'];
        const status = Math.random() > 0.7 ? statuses[Math.floor(Math.random() * statuses.length)] : template.status;

        // Progress calculation
        let progress = 0;
        if (status === 'completed') progress = 100;
        else if (status === 'upcoming') progress = 0;
        else if (status === 'at-risk') progress = Math.floor(Math.random() * 80); // Stuck somewhere
        else progress = Math.floor(Math.random() * 90) + 10; // 10-99%

        deliverablesPayload.push({
            title: `${template.title} - Phase ${Math.floor(Math.random() * 3) + 1}`,
            description: `Implementation tasks for ${template.title}`,
            owner_id: owner.id,
            status,
            progress,
            deadline: new Date(Date.now() + (Math.random() * 30 - 10) * 24 * 60 * 60 * 1000).toISOString(), // +/- 10 days
        });
    }

    const { data: deliverables, error: deliverablesError } = await supabase
        .from('deliverables')
        .insert(deliverablesPayload)
        .select();

    if (deliverablesError) throw new Error(`Failed to insert deliverables: ${deliverablesError.message}`);
    if (!deliverables) throw new Error('No deliverables returned');

    // 5. Insert Updates (Historical Data)
    console.log('💬 Inserting updates...');
    const updatesPayload = [];
    const now = new Date();

    for (let i = 0; i < 150; i++) { // 150 updates - denser data
        let daysAgo;
        // Bias towards recent activity for better chart visuals (60% in last 14 days)
        if (Math.random() > 0.4) {
            daysAgo = Math.floor(Math.random() * 14);
        } else {
            daysAgo = Math.floor(Math.random() * 45) + 15; // 15-60 days ago
        }

        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const member = members[Math.floor(Math.random() * members.length)];
        const deliverable = deliverables[Math.floor(Math.random() * deliverables.length)];

        updatesPayload.push({
            content: `Update on ${deliverable.title}: Making progress with the new components.`,
            author_id: member.id,
            deliverable_id: deliverable.id,
            is_help_request: Math.random() > 0.9, // 10% help requests
            created_at: date.toISOString(),
        });
    }

    const { error: updatesError } = await supabase.from('updates').insert(updatesPayload);
    if (updatesError) throw new Error(`Failed to insert updates: ${updatesError.message}`);

    console.log('✅ Database seeded successfully!');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
