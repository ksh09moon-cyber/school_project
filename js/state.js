// Local browser state. Data is stored on this device in localStorage.
window.ClosetState = {
    currentUser: localStorage.getItem('closet_nickname') || null,
    apiKey: localStorage.getItem('closet_api_key') || null,
    clothingItems: JSON.parse(localStorage.getItem('closet_items')) || [],
    confirmAction: null
};
