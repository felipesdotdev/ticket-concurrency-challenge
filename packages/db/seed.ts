
import { db } from './src/index';
import { event, ticket } from './src/schema/ticket';

async function seed() {
  console.log('Inserting seed data...');
  
  // Create an event
  const [newEvent] = await db.insert(event).values({
    id: 'evt_1',
    name: 'Grande Final 2026',
    description: 'A maior final de todos os tempos',
    venue: 'Estádio Monumental',
    eventDate: new Date('2026-12-12T20:00:00Z'),
  }).returning();
  
  console.log('Event created:', newEvent.name);

  // Create tickets for the event
  await db.insert(ticket).values([
    {
      id: 'tkt_1',
      eventId: newEvent.id,
      name: 'Arquibancada Norte',
      description: 'Visão panorâmica do campo',
      price: 15000, // 150.00
      totalQuantity: 100,
      availableQuantity: 100, // <--- This will fix the 'Sold Out' issue
    },
    {
      id: 'tkt_2',
      eventId: newEvent.id,
      name: 'VIP Lounge',
      description: 'Open food e open bar',
      price: 50000, // 500.00
      totalQuantity: 20,
      availableQuantity: 20,
    }
  ]);
  
  console.log('Tickets created successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

