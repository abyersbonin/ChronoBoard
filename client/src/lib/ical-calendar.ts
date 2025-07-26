export const syncIcalCalendar = async (userId: string) => {
  const response = await fetch(`/api/sync-ical-calendar/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`iCal sync failed: ${response.statusText}`);
  }

  return response.json();
};

export const updateIcalUrls = async (userId: string, icalUrls: string[]) => {
  const response = await fetch(`/api/settings/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ icalUrls }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update iCal URLs: ${response.statusText}`);
  }

  return response.json();
};