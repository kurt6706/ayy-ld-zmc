/**
 * Utility functions for the chat application
 */

// Formats a Firestore timestamp, Date, or milliseconds into an elegant Turkish display format
export function formatMessageTime(timestamp: any): string {
  if (!timestamp) return '';

  let date: Date;

  if (typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeString = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeString;
  } else if (isYesterday) {
    return `Dün ${timeString}`;
  } else {
    const dateString = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    return `${dateString} ${timeString}`;
  }
}

// Generate a charming deterministic avatar based on the user's name
export function getDeterministicAvatar(name: string): string {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'EF4444', // Red
    'F59E0B', // Amber
    '10B981', // Emerald
    '3B82F6', // Blue
    '6366F1', // Indigo
    '8B5CF6', // Violet
    'EC4899', // Pink
    '14B8A6', // Teal
  ];
  const color = colors[hash % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=ffffff&bold=true&size=128`;
}
