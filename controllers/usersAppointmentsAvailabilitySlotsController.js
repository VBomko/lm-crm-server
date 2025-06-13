

const { supabase, supabaseCrmSettings } = require('../utils'); // Removed formatDate from utils
const { startOfWeek, endOfWeek, eachDayOfInterval, format, formatISO } = require('date-fns'); // Added formatISO if needed elsewhere, format for yyyy-MM-dd
const moment = require('moment-timezone'); // For timezone conversion

/**
 * Get the current week's dates (Monday to Sunday)
 * @returns {Array} Array of date objects for the current week
 */
const getCurrentWeekDates = () => {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 }); // 1 for Monday
  const sunday = endOfWeek(today, { weekStartsOn: 1 });
  
  const weekDates = eachDayOfInterval({
    start: monday,
    end: sunday
  });
  
  // Debug: Log the days of the week
  console.log('Week dates (using date-fns):');
  weekDates.forEach(date => {
    // Ensure getDayName is compatible or use format directly
    console.log(`${format(date, 'yyyy-MM-dd')} - ${getDayName(date)}`);
  });
  
  return weekDates;
};

/**
 * Format time string to Date object
 * @param {string} timeStr - Time string in format "HH:MM:SS"
 * @param {Date} dateObj - Date object to set the time on
 * @returns {Date} Date object with the specified time
 */
const timeStringToDate = (timeStr, dateObj) => {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const date = new Date(dateObj);
  date.setHours(hours, minutes, seconds || 0);
  return date;
};

/**
 * Format Date object to time string
 * @param {Date} date - Date object
 * @returns {string} Time string in format "HH:MM:SS"
 */
const dateToTimeString = (date) => {
  try {
    if (date instanceof Date && !isNaN(date)) {
      return date.toTimeString().split(' ')[0];
    }
    console.warn('Invalid date passed to dateToTimeString:', date);
    return ''; // Return empty string for invalid dates, filter(Boolean) will remove it
  } catch (error) {
    console.error('Error in dateToTimeString:', error, 'Input date:', date);
    return ''; // Return empty string on error
  }
};

/**
 * Get day name from Date object
 * @param {Date} date - Date object
 * @returns {string} Day name (Monday, Tuesday, etc.)
 */
const getDayName = (date) => {
  // 'EEEE' gives the full day name, e.g., "Monday"
  return format(date, 'EEEE');
};

/**
 * Get User Appointments Availability Slots
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Availability slots for the user
 */
/**
 * Get company default timezone
 * @returns {string} Default timezone (e.g., 'America/New_York')
 */
const getCompanyDefaultTimezone = async () => {
  try {
    const { data, error } = await supabaseCrmSettings
      .from('Company_Settings')
      .select('Default_Time_Zone')
      .eq('Name', 'Default')
      .single();

    if (error) {
      console.error('Error fetching company settings:', error);
      return 'UTC'; // Default fallback
    }

    return data?.Default_Time_Zone || 'UTC';
  } catch (err) {
    console.error('Error in getCompanyDefaultTimezone:', err);
    return 'UTC'; // Default fallback
  }
};

/**
 * Convert UTC date to company timezone
 * @param {Date} utcDate - Date in UTC
 * @param {string} timezone - Target timezone
 * @returns {Date} Date in company timezone
 */
/**
 * Convert UTC date to company timezone
 * @param {Date} utcDate - Date in UTC
 * @param {string} timezone - Target timezone (e.g., 'America/New_York')
 * @returns {Date} Date in company timezone
 */
const convertUTCToTimezone = (utcDate, timezone) => {
  // Create a moment object from the UTC date
  const utcMoment = moment.utc(utcDate);
  
  // Convert to the target timezone
  const timezoneMoment = utcMoment.clone().tz(timezone);
  
  // Return as a JavaScript Date object
  return timezoneMoment.toDate();
};

const getUserAppointmentsAvailabilitySlots = async (req, res) => {
  try {
    // Fetch company settings to get default timezone
    const defaultTimezone = await getCompanyDefaultTimezone();
    console.log(`Using company default timezone: ${defaultTimezone}`);
    
    // Get sales rep users
    const users = await getSalesRepsUsers();
    
    // Get their availability settings
    const usersAppointmentsAvailability = await getSalesRepsUsersAppointmentsAvailability(users);
    
    // Get existing appointments for the current week
    const appointments = await getAppointments(users);
    console.log('appointments',appointments);
    // Get current week dates
    const weekDates = getCurrentWeekDates();
    
    // Process availability slots for each user
    const processedAvailabilitySlots = processAvailabilitySlots(
      users,
      usersAppointmentsAvailability,
      appointments,
      weekDates,
      defaultTimezone
    );

    // Format the response as an array (no specific date for current week)
    const formattedResponse = formatResponseAsArray(processedAvailabilitySlots, defaultTimezone, null);

    // Check if any availability slots were found
    const hasAvailability = formattedResponse.some(user =>
      user.availability && user.availability.length > 0 &&
      user.availability.some(day => day.slots && day.slots.length > 0)
    );

    return res.status(200).json({
      success: true,
      message: hasAvailability
        ? 'Availability slots retrieved successfully'
        : 'No availability slots found for the current week',
      data: formattedResponse || []
    });
  } catch (err) {
    console.error('Server error in getUserAppointmentsAvailabilitySlots:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

/**
 * Process availability slots for each user
 * @param {Array} users - List of users
 * @param {Array} usersAvailability - User availability settings
 * @param {Array} appointments - Existing appointments
 * @param {Array} weekDates - Current week dates
 * @returns {Array} Processed availability slots
 */
const processAvailabilitySlots = (users, usersAvailability, appointments, dates, timezone) => {
  const result = [];
  
  // Process each user
  users.forEach(user => {
    // Find user's availability settings
    const userAvailability = usersAvailability.find(ua => ua.User === user.Id);
    
    if (!userAvailability || !userAvailability.Availability_Slots) {
      return; // Skip if no availability settings
    }
    
    // Parse availability slots
    let availabilitySlots = [];
    try {
      // Ensure Availability_Slots is an array before mapping
      if (Array.isArray(userAvailability.Availability_Slots)) {
        availabilitySlots = userAvailability.Availability_Slots.map(slot => {
          try {
            return JSON.parse(slot);
          } catch (parseError) {
            console.error(`Error parsing individual slot for user ${user.Id}:`, parseError, slot);
            return null;
          }
        }).filter(Boolean); // Remove any null values from failed parsing
      } else {
        console.error(`Availability_Slots is not an array for user ${user.Id}:`, userAvailability.Availability_Slots);
      }
    } catch (error) {
      console.error(`Error processing availability slots for user ${user.Id}:`, error);
      return;
    }
    
    // Skip if no valid availability slots
    if (availabilitySlots.length === 0) {
      return;
    }
    
    // Get max appointments count
    const maxAppointments = userAvailability.Max_Numbers_Count_of_Appointments || 1;
    
    // Get user's appointments
    const userAppointments = appointments.filter(appointment => appointment.Staff === user.Id);
    
    // Process each date in the provided dates array (could be a week or a single day)
    dates.forEach(date => {
      const dayName = getDayName(date);
      console.log(`Processing day: ${dayName} (${date.toISOString().split('T')[0]})`);
      
      // Find availability for this day of the week
      const dayAvailability = availabilitySlots.find(slot => slot.day === dayName);
      
      if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
        console.log(`No availability found for ${dayName}`);
        return; // Skip if no availability for this day
      }
      
      console.log(`Found availability for ${dayName}:`, dayAvailability);
      
      // Generate expanded slots (1 hour before and after) with timezone conversion
      const expandedSlots = generateExpandedSlots(dayAvailability.slots, date, timezone);
      
      // Count appointments for this day
      const dayAppointments = userAppointments.filter(appointment => {
        try {
          if (!appointment.Scheduled_Time) {
            return false;
          }
          
          // Extract date from ISO string directly to avoid time zone issues
          // Format is typically: "2025-05-12T15:00:00+00:00"
          const appointmentDateStr = appointment.Scheduled_Time.split('T')[0]; // This is UTC date part
          const currentDateStr = format(date, 'yyyy-MM-dd'); // Local date part
          
          // To compare appointment (UTC) with current processing date (local),
          // it's better to compare Date objects or ensure both are in the same format/zone.
          // For simplicity, if appointment.Scheduled_Time is always UTC,
          // and `date` is local, we need a consistent comparison.
          // Let's compare the UTC date part of `date` with `appointmentDateStr`.
          const currentDateUTCDateStr = formatISO(date, { representation: 'date' });

          // Check if this is a multi-day appointment
          if (appointment.End_Time) {
            const appointmentEndDateStr = appointment.End_Time.split('T')[0];
            
            // If the current date is between start and end dates (inclusive), it's a match
            if (currentDateUTCDateStr >= appointmentDateStr && currentDateUTCDateStr <= appointmentEndDateStr) {
              console.log(`Found multi-day appointment spanning from ${appointmentDateStr} to ${appointmentEndDateStr} that includes ${currentDateUTCDateStr} for user ${user.Id}`);
              return true;
            }
          }

          // For single-day appointments or if not within multi-day range
          const isSameDay = appointmentDateStr === currentDateUTCDateStr;
          
          if (isSameDay) {
            console.log(`Found appointment on ${currentDateStr} at ${appointment.Scheduled_Time} for user ${user.Id}`);
          }
          
          return isSameDay;
        } catch (error) {
          console.error(`Error processing appointment date: ${appointment.Id}`, error);
          return false;
        }
      });
      
      if (dayAppointments.length > 0) {
        console.log(`User ${user.Id} has ${dayAppointments.length} appointments on ${date.toDateString()}`);
      }
      
      // If max appointments reached, skip this day
      if (dayAppointments.length >= maxAppointments) {
        return;
      }
      
      // Filter out slots that conflict with appointments
      const availableSlots = filterConflictingSlots(expandedSlots, dayAppointments, timezone);
      
      if (availableSlots.length > 0) {
        // Add to result
        try {
          // Format date as YYYY-MM-DD for the output JSON, representing the local date
          const formattedDate = format(date, 'yyyy-MM-dd');
            
          let capabilities = [];
          if (user.Project_Categories && Array.isArray(user.Project_Categories)) {
            user.Project_Categories.forEach(categoryStr => {
              try {
                const categoryObj = JSON.parse(categoryStr);
                if (categoryObj && categoryObj.name) {
                  capabilities.push(categoryObj.name);
                }
              } catch (parseError) {
                console.error(`Error parsing Project_Category for user ${user.Id}:`, parseError, categoryStr);
              }
            });
          }
            
          result.push({
            userId: user.Id,
            userName: user.Name,
            capabilities: capabilities, // Add capabilities here
            day: formattedDate,
            slots: availableSlots.map(slot => dateToTimeString(slot)).filter(Boolean) // Filter out any undefined values
          });
        } catch (error) {
          console.error(`Error formatting date for user ${user.Id}:`, error);
        }
      }
    });
  });
  
  return result;
};

/**
 * Generate expanded slots (1 hour before and after)
 * @param {Array} baseSlots - Base time slots
 * @param {Date} date - Date object
 * @returns {Array} Expanded slots as Date objects
 */
const generateExpandedSlots = (baseSlots, date, timezone) => {
  const expandedSlots = [];
  
  baseSlots.forEach(timeStr => {
    try {
      // Validate time string format
      if (typeof timeStr !== 'string' || !timeStr.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        console.warn(`Invalid time string format: ${timeStr}`);
        return;
      }
      
      // Ensure time string has seconds
      const normalizedTimeStr = timeStr.includes(':') && timeStr.split(':').length === 2
        ? `${timeStr}:00`
        : timeStr;
      
      console.log(`Processing time slot: ${normalizedTimeStr} for date ${date.toISOString()}`);
      
      // Convert time string to Date (keeping original timezone)
      const baseTime = timeStringToDate(normalizedTimeStr, date);
      
      // Add base time
      expandedSlots.push(new Date(baseTime));
      
      // Add 1 hour before
      const hourBefore = new Date(baseTime);
      hourBefore.setHours(baseTime.getHours() - 1);
      expandedSlots.push(hourBefore);
      
      // Add 1 hour after
      const hourAfter = new Date(baseTime);
      hourAfter.setHours(baseTime.getHours() + 1);
      expandedSlots.push(hourAfter);
    } catch (error) {
      console.error(`Error processing time slot: ${timeStr}`, error);
    }
  });
  
  // Sort slots chronologically
  return expandedSlots.sort((a, b) => a - b);
};

/**
 * Filter out slots that conflict with appointments
 * @param {Array} slots - Time slots as Date objects
 * @param {Array} appointments - Appointments for the day
 * @returns {Array} Filtered slots
 */
const filterConflictingSlots = (slots, appointments, timezone) => {
  if (appointments.length === 0) {
    return slots; // No conflicts if no appointments
  }
  
  // Debug appointments
  console.log('Appointments for filtering:', JSON.stringify(appointments.map(a => ({
    id: a.Id,
    time: a.Scheduled_Time,
    staff: a.Staff
  }))));
  
  return slots.filter(slot => {
    // Get the hour from the slot (keep in original timezone)
    const slotHour = slot.getHours();
    const slotMinutes = slot.getMinutes();
    
    // Format for comparison
    const slotTimeStr = `${slotHour.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
    
    // Check if this slot conflicts with any appointment
    const hasConflict = appointments.some(appointment => {
      try {
        if (!appointment.Scheduled_Time) {
          return false;
        }
        
        // Get the current date being processed (the date of the slot)
        const slotDate = new Date(slot);
        const slotDateOnly = moment(slotDate).format('YYYY-MM-DD');
        
        // Parse the appointment start time and convert from UTC to company timezone
        const appointmentStartTimeStr = appointment.Scheduled_Time;
        console.log(`Raw appointment start time (UTC): ${appointmentStartTimeStr}`);
        
        // Convert UTC appointment start time to company timezone
        const appointmentStartMoment = moment.utc(appointmentStartTimeStr).tz(timezone);
        const appointmentStartDate = appointmentStartMoment.format('YYYY-MM-DD');
        
        const appointmentStartHour = appointmentStartMoment.hours();
        const appointmentStartMinutes = appointmentStartMoment.minutes();
        
        console.log(`Appointment start time in ${timezone}: ${appointmentStartHour}:${appointmentStartMinutes}`);
        
        // Check if the appointment has an end time
        let appointmentEndMoment;
        let appointmentEndHour;
        let appointmentEndMinutes;
        let appointmentEndDate;
        
        if (appointment.End_Time) {
          // Parse the appointment end time and convert from UTC to company timezone
          const appointmentEndTimeStr = appointment.End_Time;
          console.log(`Raw appointment end time (UTC): ${appointmentEndTimeStr}`);
          
          // Convert UTC appointment end time to company timezone
          appointmentEndMoment = moment.utc(appointmentEndTimeStr).tz(timezone);
          appointmentEndDate = appointmentEndMoment.format('YYYY-MM-DD');
          
          appointmentEndHour = appointmentEndMoment.hours();
          appointmentEndMinutes = appointmentEndMoment.minutes();
          
          console.log(`Appointment end time in ${timezone}: ${appointmentEndHour}:${appointmentEndMinutes}`);
        }
        
        console.log(`Comparing slot ${slotTimeStr} on ${slotDateOnly} with appointment from ${appointmentStartDate} to ${appointmentEndDate || appointmentStartDate}`);
        
        // Create a moment object for the slot time
        const slotMoment = moment(slot);
        
        // For multi-day appointments, check if the slot date falls within the appointment's date range
        let isWithinDateRange = false;
        
        // Debug the date we're processing
        console.log(`Processing slot date: ${slotDateOnly}, comparing with appointment from ${appointmentStartDate} to ${appointmentEndDate}`);
        
        if (appointmentEndMoment) {
          // Check if the slot date is on or after the appointment start date
          // and on or before the appointment end date
          const slotMomentDateOnly = moment(slotDateOnly);
          const appointmentStartMomentDateOnly = moment(appointmentStartDate);
          const appointmentEndMomentDateOnly = moment(appointmentEndDate);
          
          isWithinDateRange = (
            slotMomentDateOnly.isSameOrAfter(appointmentStartMomentDateOnly, 'day') &&
            slotMomentDateOnly.isSameOrBefore(appointmentEndMomentDateOnly, 'day')
          );
          
          // If the slot date is between start and end date (not including start/end dates),
          // mark it as conflicting immediately
          if (isWithinDateRange &&
              !slotMomentDateOnly.isSame(appointmentStartMomentDateOnly, 'day') &&
              !slotMomentDateOnly.isSame(appointmentEndMomentDateOnly, 'day')) {
            console.log(`Conflict found: Slot ${slotTimeStr} is on an intermediate day (${slotDateOnly}) of a multi-day appointment from ${appointmentStartDate} to ${appointmentEndDate}`);
            return true;
          }
          
          // For debugging, log the full date range
          console.log(`Slot date ${slotDateOnly} is ${isWithinDateRange ? 'within' : 'outside'} appointment date range ${appointmentStartDate} to ${appointmentEndDate}`);
          
          // If the slot date is on the same day as the appointment end date,
          // check if the slot time is before the appointment end time
          if (slotDateOnly === appointmentEndDate) {
            console.log(`Slot is on the same day as appointment end date. Checking time...`);
            // If the slot hour is after the appointment end hour, it's not within the range
            if (slotMoment.hours() > appointmentEndHour) {
              isWithinDateRange = false;
              console.log(`Slot time ${slotMoment.hours()}:${slotMoment.minutes()} is after appointment end time ${appointmentEndHour}:${appointmentEndMinutes}, so it's not within range`);
            }
          }
        } else {
          // If there's no end time, check if the slot date is the same as the appointment date
          isWithinDateRange = slotDateOnly === appointmentStartDate;
        }
        
        // If the slot date is not within the appointment's date range, there's no conflict
        if (!isWithinDateRange) {
          return false;
        }
        
        // For multi-day appointments, handle conflict detection differently
        if (appointmentEndMoment) {
          // Case 1: If the slot is on a day between start and end dates (not including start/end dates),
          // it always conflicts - all slots on intermediate days are unavailable
          if (slotDateOnly !== appointmentStartDate && slotDateOnly !== appointmentEndDate) {
            console.log(`Conflict found: Slot ${slotTimeStr} is on an intermediate day of a multi-day appointment`);
            return true;
          }
          
          // Case 2: If the slot is on the start date, it conflicts if it's at or after the start time
          if (slotDateOnly === appointmentStartDate) {
            const isAfterOrEqualToStartTime = slotMoment.hours() >= appointmentStartHour ||
              (slotMoment.hours() === appointmentStartHour && slotMoment.minutes() >= appointmentStartMinutes);
            
            if (isAfterOrEqualToStartTime) {
              console.log(`Conflict found: Slot ${slotTimeStr} is on appointment start date and at/after start time`);
              return true;
            }
          }
          
          // Case 3: If the slot is on the end date, it conflicts if it's before the end time
          if (slotDateOnly === appointmentEndDate) {
            const isBeforeEndTime = slotMoment.hours() < appointmentEndHour ||
              (slotMoment.hours() === appointmentEndHour && slotMoment.minutes() < appointmentEndMinutes);
            
            if (isBeforeEndTime) {
              console.log(`Conflict found: Slot ${slotTimeStr} is on appointment end date and before end time`);
              return true;
            }
          }
          
          return false;
        } else {
          // For single-day appointments, use the original logic
          // A slot conflicts if it's within 1 hour of the appointment start time
          const conflictsWithStart = Math.abs(slotMoment.hours() - appointmentStartHour) <= 1;
          return conflictsWithStart;
        }
        
        // This code is unreachable now as we return directly from the conditions above
        // Keeping a debug log just in case
        console.log(`No conflict found for slot ${slotTimeStr} with appointment from ${appointmentStartDate} to ${appointmentEndDate || appointmentStartDate}`);
        return false;
      } catch (error) {
        console.error(`Error checking appointment conflict: ${appointment.Id}`, error);
        return false;
      }
    });
    
    return !hasConflict;
  });
};


const getSalesRepsUsersAppointmentsAvailability = async (users) => {
  if (!users || users.length === 0) {
    return [];
  }

  const userIds = users.map(user => user.Id);
  const { data, error } = await supabaseCrmSettings
    .from('User_Appointments_Availability')
    .select('User,Availability_Slots,Max_Numbers_Count_of_Appointments')
    .in('User', userIds)
    
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Error retrieving Sales Reps Users Appointments Availability: ${error.message}`);
  }

  return data || [];
}



const getSalesRepsUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('Id,Name,Project_Categories')
      .eq('Est_App_Login', true)
      .eq('Active', true)
    console.log('getSalesRepsUsers', data);
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Error retrieving Sales Reps Users: ${error.message}`);
    }
    
    return data || [];
  } catch (err) {
    console.error('Server error in getSalesRepsUsers:', err);
    throw err;
  }
}

const getAppointments = async (users, specificDate = null) => {
  if (!users || users.length === 0) {
    return [];
  }

  const userIds = users.map(user => user.Id);
  
  let startDate, endDate;
  
  if (specificDate) {
    // If a specific date is provided, set the start and end to that day
    const startOfDay = new Date(specificDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(specificDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    startDate = formatISO(startOfDay);
    endDate = formatISO(endOfDay);
    
    console.log(`Fetching appointments for specific date: ${format(specificDate, 'yyyy-MM-dd')}`);
  } else {
    // Otherwise, get the current week's dates
    const weekDates = getCurrentWeekDates();
    startDate = formatISO(weekDates[0]);
    
    // Create a new date object for the end of the week
    const endOfLocalSunday = endOfWeek(weekDates[6], { weekStartsOn: 1 });
    endOfLocalSunday.setHours(23, 59, 59, 999); // Set to end of day in local time
    endDate = formatISO(endOfLocalSunday);
    
    console.log(`Fetching appointments for current week: ${format(weekDates[0], 'yyyy-MM-dd')} to ${format(endOfLocalSunday, 'yyyy-MM-dd')}`);
  }
  
  // Query appointments for the specified time period
  const { data, error } = await supabase
    .from('Events')
    .select('Id,Scheduled_Time,Staff,End_Time')
    .in('Staff', userIds)
    .gte('Scheduled_Time', startDate)
    .lte('Scheduled_Time', endDate);
  
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Error retrieving appointments: ${error.message}`);
  }
  
  // Log appointments for debugging
  if (data && data.length > 0) {
    const period = specificDate ? `date ${format(specificDate, 'yyyy-MM-dd')}` : 'current week';
    console.log(`Found ${data.length} appointments for the ${period}`);
    console.log('Sample appointment:', JSON.stringify(data[0]));
  } else {
    const period = specificDate ? `date ${format(specificDate, 'yyyy-MM-dd')}` : 'current week';
    console.log(`No appointments found for the ${period}`);
  }

  return data || [];
}

/**
 * Format the response as an array
 * @param {Array} processedSlots - Processed availability slots
 * @returns {Array} Formatted response as an array
 */
const formatResponseAsArray = (processedSlots, timezone, specificDate = null) => {
  if (!processedSlots || processedSlots.length === 0) {
    return [];
  }
  
  // Group slots by user
  const userMap = {};
  
  processedSlots.forEach(item => {
    // item now contains userId, userName, capabilities, day, slots
    if (!userMap[item.userId]) {
      userMap[item.userId] = { // Store userName and capabilities along with availability
        userName: item.userName,
        capabilities: item.capabilities || [], // Ensure capabilities is an array
        availability: []
      };
    }
    
    userMap[item.userId].availability.push({
      day: item.day,
      slots: item.slots
    });
  });
  
  // Get the current week's Monday and Sunday dates for reference using date-fns
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const sunday = endOfWeek(today, { weekStartsOn: 1 });
  
  // Ensure sunday is at the end of the day for comparison
  sunday.setHours(23, 59, 59, 999);

  console.log(`Current week Monday (date-fns): ${format(monday, 'yyyy-MM-dd HH:mm:ss')}`);
  console.log(`Current week Sunday (date-fns): ${format(sunday, 'yyyy-MM-dd HH:mm:ss')}`);
  
  // Filter and sort availability
  Object.keys(userMap).forEach(currentUserId => {
    userMap[currentUserId].availability = userMap[currentUserId].availability
      .filter(item => {
        const date = new Date(item.day);
        // Ensure date is valid before comparison
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date string encountered: ${item.day} for user ${currentUserId}`);
          return false;
        }
        
        // If a specific date is provided, only include that date
        if (specificDate) {
          const specificDateStr = format(specificDate, 'yyyy-MM-dd');
          const itemDateStr = format(date, 'yyyy-MM-dd');
          const isMatchingDate = itemDateStr === specificDateStr;
          console.log(`Date ${item.day} for user ${currentUserId}: ${isMatchingDate ? 'matches specific date' : 'does not match specific date'} ${specificDateStr}`);
          return isMatchingDate;
        } else {
          // Otherwise, only include dates from the current Monday-Sunday week
          const isInCurrentWeek = date >= monday && date <= sunday;
          // console.log(`Date ${item.day} for user ${currentUserId}: ${isInCurrentWeek ? 'in current week' : 'not in current week'}`);
          return isInCurrentWeek;
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.day);
        const dateB = new Date(b.day);
        // Handle potential invalid dates from sort
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        return dateA - dateB;
      });
  });
  
  // Convert to array format
  return Object.keys(userMap).map(currentUserId => ({
    userId: currentUserId,
    userName: userMap[currentUserId].userName,
    capabilities: userMap[currentUserId].capabilities, // Include capabilities
    availability: userMap[currentUserId].availability
  }));
};

/**
 * Get User Appointments Availability Slots for a specific day
 *
 * @param {Object} req - Express request object with day parameter
 * @param {Object} res - Express response object
 * @returns {Object} - Availability slots for the user on the specified day
 */
const getUserAppointmentsAvailabilitySlotsForDay = async (req, res) => {
  try {
    // Get the day parameter from the request
    const { day } = req.params;
    
    // Validate the day parameter format (YYYY-MM-DD)
    if (!day || !day.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day format. Please use YYYY-MM-DD format (e.g., 2025-06-12)'
      });
    }
    
    // Parse the day parameter to create a Date object
    const specificDate = new Date(day);
    
    // Check if the date is valid
    if (isNaN(specificDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date. Please provide a valid date in YYYY-MM-DD format'
      });
    }
    
    // Get the day name (e.g., "Monday", "Tuesday") for the specific date
    const dayName = getDayName(specificDate);
    console.log(`Specific date ${day} is a ${dayName} - will check for availability slots on ${dayName}s`);
    
    // Fetch company settings to get default timezone
    const defaultTimezone = await getCompanyDefaultTimezone();
    console.log(`Using company default timezone: ${defaultTimezone}`);
    
    // Get sales rep users
    const users = await getSalesRepsUsers();
    
    // Get their availability settings
    const usersAppointmentsAvailability = await getSalesRepsUsersAppointmentsAvailability(users);
    
    // Get existing appointments for the specific date
    const appointments = await getAppointments(users, specificDate);
    
    // Create an array with just the specific date
    const specificDateArray = [specificDate];
    
    // Process availability slots for each user for the specific date
    const processedAvailabilitySlots = processAvailabilitySlots(
      users,
      usersAppointmentsAvailability,
      appointments,
      specificDateArray,
      defaultTimezone
    );
    
    // Format the response as an array with the specific date
    const formattedResponse = formatResponseAsArray(processedAvailabilitySlots, defaultTimezone, specificDate);
    
    // Check if any availability slots were found
    const hasAvailability = formattedResponse.some(user =>
      user.availability && user.availability.length > 0 &&
      user.availability.some(day => day.slots && day.slots.length > 0)
    );
    
    return res.status(200).json({
      success: true,
      message: hasAvailability
        ? `Availability slots for ${day} retrieved successfully`
        : `No availability slots found for ${day}`,
      data: formattedResponse || []
    });
  } catch (err) {
    console.error(`Server error in getUserAppointmentsAvailabilitySlotsForDay for day ${req.params.day}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports = {
  getUserAppointmentsAvailabilitySlots,
  getUserAppointmentsAvailabilitySlotsForDay,
  getCompanyDefaultTimezone, // Export timezone utility functions
  convertUTCToTimezone
};