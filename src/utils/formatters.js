export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  // Reset times to compare just dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
  
  if (diffDays === 0) {
    return `Hoy, ${timeString}`;
  } else if (diffDays === -1) {
    return `Ayer, ${timeString}`;
  } else if (diffDays === 1) {
    return `Mañana, ${timeString}`;
  } else {
    // Return standard date format if older
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}, ${timeString}`;
  }
};
