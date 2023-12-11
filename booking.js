document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });
});



function saveFormData() {
    // Retrieve form values
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const checkInDate = document.getElementById('check-in').value.trim();
    const checkOutDate = document.getElementById('check-out').value.trim();

    // Validate room numbers
    const numberOfSingleRooms = parseInt(document.getElementById('numberOfSingleRooms').value) || 0;
    const numberOfDoubleRooms = parseInt(document.getElementById('numberOfDoubleRooms').value) || 0;
    const numberOfTripleRooms = parseInt(document.getElementById('numberOfTripleRooms').value) || 0;

    // Define room costs
    const singleRoomCost = 25000.00;
    const doubleRoomCost = 35000.00;
    const tripleRoomCost = 40000.00;
    const extraMealCost = 5000.00;
    const extraBedCost = 8000.00;

    // Calculate room costs
    const singleRoomTotal = numberOfSingleRooms * singleRoomCost;
    const doubleRoomTotal = numberOfDoubleRooms * doubleRoomCost;
    const tripleRoomTotal = numberOfTripleRooms * tripleRoomCost;

    // Calculate total cost
    const totalCost = singleRoomTotal + doubleRoomTotal + tripleRoomTotal;

    // Validate extra requirements
    const extraRequirementsCheckboxes = document.querySelectorAll('input[name="extraRequirements"]:checked');
    const extraRequirements = Array.from(extraRequirementsCheckboxes, checkbox => checkbox.value);

    // Validate required fields
    if (!customerName || !customerPhone || !checkInDate || !checkOutDate) {
        alert('Please fill in all required fields.');
        return; // Stop further execution
    }

    // Validate at least one room type is selected
    const roomTypeCheckboxes = document.querySelectorAll('input[name="roomType"]:checked');
    if (roomTypeCheckboxes.length === 0) {
        alert('Please select at least one type of room.');
        return; // Stop further execution
    }

    // Ensure room type is selected only if corresponding room number is greater than 0
    if (numberOfSingleRooms === 0 && document.getElementById('singleRoom').checked) {
        alert('Please enter the number of Single Rooms.');
        return; 
    }

    if (numberOfDoubleRooms === 0 && document.getElementById('doubleRoom').checked) {
        alert('Please enter the number of Double Rooms.');
        return; 
    }

    if (numberOfTripleRooms === 0 && document.getElementById('tripleRoom').checked) {
        alert('Please enter the number of Triple Rooms.');
        return; 
    }

    // Validate number of adults
    const numberOfAdults = parseInt(document.getElementById('numberOfAdults').value) || 0;
    if (numberOfAdults < 1) {
        alert('Please enter at least one adult.');
        return; 
    }

    // Calculate the number of kids above 5
    const numberOfKidsAbove5 = parseInt(document.getElementById('numberOfChildren').value) || 0;

    // Calculate extra meal cost for kids above 5
    const extraMealTotal = document.getElementById('extraMeal').checked ? numberOfKidsAbove5 * extraMealCost : 0;
    // Calculate extra bed cost for kids above 5
    const extraBedTotal = document.getElementById('extraBed').checked ? numberOfKidsAbove5 * extraBedCost : 0;
    // Calculate total cost including extras
    const totalCostWithExtras = totalCost + extraMealTotal + extraBedTotal;

    // Retrieve promo code from the form
    const promoCode = document.getElementById('promoCode').value.trim();

    // Save form data to local storage
    const formData = {
        customerName,
        customerPhone,
        checkInDate,
        checkOutDate,
        roomType: Array.from(roomTypeCheckboxes, checkbox => checkbox.value),
        numberOfSingleRooms,
        numberOfDoubleRooms,
        numberOfTripleRooms,
        numberOfAdults,
        numberOfChildren: numberOfKidsAbove5, 
        extraRequirements,
        promoCode,
    };

    // Retrieve existing bookings from local storage
    const existingBookingsJSON = localStorage.getItem('hotelBookingData');
    let existingBookings = existingBookingsJSON ? JSON.parse(existingBookingsJSON) : [];

    // Ensure that existingBookings is an array
    if (!Array.isArray(existingBookings)) {
        existingBookings = [];
    }

    // Save the new booking to the array
    existingBookings.push(formData);

    // Save the updated array back to local storage
    localStorage.setItem('hotelBookingData', JSON.stringify(existingBookings));

    // Set the flag to indicate that new bookings are available
    localStorage.setItem('newBookingsFlag', 'true');

    // Update the UI to display the cost of the current booking
    document.getElementById('DisplayBookNow').innerHTML = `Total Cost: ${totalCostWithExtras.toFixed(2)} LKR`;

    // Display booked information
    displayBookedData();
}


function clearFormData() {
    // Clear displayed information
    document.getElementById('DisplayBookNow').innerHTML = '';
    document.getElementById('hotelBookingForm').reset();
    document.getElementById('DisplayLoyaltyPoints').innerHTML = '';
}

// Function to format extra requirements for display
function formatExtraRequirements(extraRequirements) {
    if (!extraRequirements || extraRequirements.length === 0) {
        return 'None';
    }

    // Check if Wi-Fi is selected
    const wifiSelected = extraRequirements.includes('wifi');

    // Check if Pool View is selected
    const poolViewSelected = extraRequirements.includes('poolView');

    // Check if Garden View is selected
    const gardenViewSelected = extraRequirements.includes('gardenView');

    // Check if Extra Meal is selected
    const extraMealSelected = extraRequirements.includes('extraMeal');

    // Check if Extra Bed is selected
    const extraBedSelected = extraRequirements.includes('extraBed');

    // Create an array to store selected options
    const selectedOptions = [];

    // Add selected options to the array
    if (wifiSelected) {
        selectedOptions.push('Wi-Fi');
    }

    if (poolViewSelected) {
        selectedOptions.push('Pool View');
    }

    if (gardenViewSelected) {
        selectedOptions.push('Garden View');
    }

    if (extraMealSelected) {
        selectedOptions.push('Extra Meal');
    }

    if (extraBedSelected) {
        selectedOptions.push('Extra Bed');
    }

    // Return formatted string
    return selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None';
}

function calculateCurrentBookingCost(formData) {
    let currentBookingCost = 0;

    const singleRoomCostPerDay = 25000;
    const doubleRoomCostPerDay = 35000;
    const tripleRoomCostPerDay = 40000;
    const extraMealCost = 5000;
    const extraBedCost = 8000;

    // Calculate the number of days between check-in and check-out
    const checkInDate = new Date(formData.checkInDate);
    const checkOutDate = new Date(formData.checkOutDate);
    const numberOfDays = Math.floor((checkOutDate - checkInDate) / (24 * 60 * 60 * 1000));

    // Calculate the cost based on selected room types
    formData.roomType.forEach(roomType => {
        switch (roomType) {
            case 'single':
                currentBookingCost += formData.numberOfSingleRooms * singleRoomCostPerDay * numberOfDays;
                break;
            case 'double':
                currentBookingCost += formData.numberOfDoubleRooms * doubleRoomCostPerDay * numberOfDays;
                break;
            case 'triple':
                currentBookingCost += formData.numberOfTripleRooms * tripleRoomCostPerDay * numberOfDays;
                break;
        }
    });

  formData.extraRequirements.forEach(extraRequirement => {
        switch (extraRequirement) {
            case 'extraMeal':
                currentBookingCost += extraMealCost * formData.numberOfChildren * numberOfDays;
                break;
            case 'extraBed':
                currentBookingCost += formData.extraRequirements.includes('extraBed') ? extraBedCost * numberOfDays * formData.numberOfChildren : 0;
                break;
        }
    });
            

    // Apply promo code discount
    if (formData.promoCode && typeof formData.promoCode === 'string') {
        if (formData.promoCode.toLowerCase() === 'promo123') {
            currentBookingCost *= 0.95; // 5% discount
        }
    }
    return currentBookingCost;
}

function checkLoyalty() {
    const existingBookingsJSON = localStorage.getItem('hotelBookingData');
    const existingBookings = existingBookingsJSON ? JSON.parse(existingBookingsJSON) : [];

    let loyaltyPoints = 0;

    existingBookings.forEach(booking => {
        if (booking.roomType.length > 3) {
            loyaltyPoints += booking.roomType.length * 20;
        }
    });

    // Save loyalty points to local storage
    localStorage.setItem('loyaltyPoints', loyaltyPoints);
    // Add this line in your JavaScript code where you want to show #DisplayLoyaltyPoints
    document.getElementById('DisplayLoyaltyPoints').classList.add('show');
    // Display loyalty points to the user
    document.getElementById('DisplayLoyaltyPoints').innerHTML = `<p>Earned Loyalty Points: ${loyaltyPoints}</p>`;
}

function displayBookedData() {
    // Check if there is a flag indicating new bookings
    const newBookingsFlag = localStorage.getItem('newBookingsFlag');

    if (newBookingsFlag === 'true') {
        // Display information for the last booking
        const existingBookingsJSON = localStorage.getItem('hotelBookingData');

        if (existingBookingsJSON) {
            const existingBookings = JSON.parse(existingBookingsJSON);

            // Display information for the last booking
            const lastBooking = existingBookings[existingBookings.length - 1];

            const displayHtml = `
                <h3>Booking Successful !!!</h3>
                <p>Name: ${lastBooking.customerName}</p>
                <p>Phone Number: ${lastBooking.customerPhone}</p>
                <p>Check-in Date: ${lastBooking.checkInDate}</p>
                <p>Check-out Date: ${lastBooking.checkOutDate}</p>
                <p>Room Type(s): ${lastBooking.roomType.join(', ')}</p>
                <p>Number of Single Rooms: ${lastBooking.numberOfSingleRooms}</p>
                <p>Number of Double Rooms: ${lastBooking.numberOfDoubleRooms}</p>
                <p>Number of Triple Rooms: ${lastBooking.numberOfTripleRooms}</p>
                <p>Adults: ${lastBooking.numberOfAdults}</p>
                <p>Children: ${lastBooking.numberOfChildren}</p>
                <p>Extra Requirements: ${formatExtraRequirements(lastBooking.extraRequirements)}</p>
                <h4>Total Cost: ${calculateCurrentBookingCost(lastBooking)} LKR</h4>
            `;

            document.getElementById('DisplayBookNow').innerHTML = displayHtml;
            // Add this line in your JavaScript code where you want to show #DisplayBookNow
            document.getElementById('DisplayBookNow').classList.add('show')
            // Reset the flag to indicate that the bookings have been displayed
            localStorage.setItem('newBookingsFlag', 'false');
        }
    } else {
        // No new bookings, keep the display area empty
        document.getElementById('DisplayBookNow').innerHTML = '';
    }
}

document.getElementById('RoomBook').addEventListener('click', saveFormData);
document.getElementById('ClearButton').addEventListener('click', clearFormData);
document.getElementById('CheckLoyalty').addEventListener('click', checkLoyalty);

window.addEventListener('load', displayBookedData);

//Adventure Booking    
// Function to validate adventure form before booking
function validateAdventureForm() {
    const adventureCategories = document.querySelectorAll('input[name="adventure"]:checked');
    const localAdultDiving = document.getElementById('localAdultDiving');
    const localKidDiving = document.getElementById('localKidDiving');
    const foreignAdultDiving = document.getElementById('foreignAdultDiving');
    const foreignKidDiving = document.getElementById('foreignKidDiving');

    // Retrieve form values
    const customerName = document.getElementById('AdventureCustomer').value.trim();
    const customerPhone = document.getElementById('AdventurePhone').value.trim();

    // Validate name and phone number
    if (!customerName || !customerPhone) {
        alert('Please enter your name and phone number.');
        return;
    }

    if (adventureCategories.length === 0) {
        alert('Please select at least one adventure category.');
        return false;
    }

    if (!localAdultDiving.checked && !localKidDiving.checked && !foreignAdultDiving.checked && !foreignKidDiving.checked) {
        alert('Please select the category.');
        return false;
    }

    // If all validations pass, proceed to calculate and display the cost
    calculateAdventureCost();
}

function calculateAdventureCost() {
    const localAdultDivingCost = 5000;
    const localKidDivingCost = 2000;
    const foreignAdultDivingCost = 10000;
    const foreignKidDivingCost = 5000;
    const guideAdultCost = 1000;
    const guideKidCost = 500;

    let totalCost = 0;

    const localAdultDiving = document.getElementById('localAdultDiving');
    const localKidDiving = document.getElementById('localKidDiving');
    const foreignAdultDiving = document.getElementById('foreignAdultDiving');
    const foreignKidDiving = document.getElementById('foreignKidDiving');

    const localKidDivingParticipants = parseInt(document.getElementById('localKidDivingParticipants').value) || 0;
    const localAdultDivingParticipants = parseInt(document.getElementById('localAdultDivingParticipants').value) || 0;
    const foreignKidDivingParticipants = parseInt(document.getElementById('foreignKidDivingParticipants').value) || 0;
    const foreignAdultDivingParticipants = parseInt(document.getElementById('foreignAdultDivingParticipants').value) || 0;

    if (localAdultDiving && localAdultDiving.checked) {
        totalCost += localAdultDivingCost * localAdultDivingParticipants;
    }
    if (localKidDiving && localKidDiving.checked) {
        totalCost += localKidDivingCost * localKidDivingParticipants;
    }
    if (foreignAdultDiving && foreignAdultDiving.checked) {
        totalCost += foreignAdultDivingCost * foreignAdultDivingParticipants;
    }
    if (foreignKidDiving && foreignKidDiving.checked) {
        totalCost += foreignKidDivingCost * foreignKidDivingParticipants;
    }

    // Add guide cost if selected
    const guideAdultCheckbox = document.getElementById('guideAdultCheckbox');
    const guideChildrenCheckbox = document.getElementById('guideChildrenCheckbox');

    if (guideAdultCheckbox && guideAdultCheckbox.checked) {
        totalCost += guideAdultCost;
    }

    if (guideChildrenCheckbox && guideChildrenCheckbox.checked) {
        totalCost += guideKidCost;
    }

    // Update the DisplayAdventureBookings div with the calculated cost
    document.getElementById('DisplayAdventureBookings').innerHTML = `
        <h3>Booking Successful !!!</h3>
        <p>Name: ${document.getElementById('AdventureCustomer').value}</p>
        <p>Phone Number: ${document.getElementById('AdventurePhone').value}</p>
        <p>Local Adult Diving: ${localAdultDiving.checked ? localAdultDivingParticipants : 0}</p>
        <p>Local Kid Diving: ${localKidDiving.checked ? localKidDivingParticipants : 0}</p>
        <p>Foreign Adult Diving: ${foreignAdultDiving.checked ? foreignAdultDivingParticipants : 0}</p>
        <p>Foreign Kid Diving: ${foreignKidDiving.checked ? foreignKidDivingParticipants : 0}</p>
        <p>Guide: ${guideAdultCheckbox.checked ? 'Adult' : ''} ${guideChildrenCheckbox.checked ? 'Children' : ''}</p>
        <h4>Total Cost: ${totalCost.toFixed(2)} LKR</h4>
    `;
    
    document.getElementById('DisplayAdventureBookings').classList.add('show');
}

function addToFavorites() {
    // Retrieve adventure booking data
    const adventureData = {
        adventure: document.querySelector('input[name="adventure"]:checked').value,
        // Add other relevant data properties
    };

    // Retrieve existing favorites from local storage or initialize an empty array
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Add the current adventure data to the favorites array
    favorites.push(adventureData);

    // Save the updated favorites array back to local storage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    alert('Adventure added to favorites!');
}

document.getElementById('AdventureBook').addEventListener('click', validateAdventureForm);
document.getElementById('AddToFavorite').addEventListener('click', addToFavorites);

