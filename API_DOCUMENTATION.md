# Sales-Rep Availability and Events API Documentation

This document provides comprehensive documentation for the Sales-Rep Availability and Events API endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Events API](#events-api)
   - [Create Event](#create-event)
   - [Get All Events](#get-all-events)
   - [Get Event by ID](#get-event-by-id)
   - [Update Event](#update-event)
   - [Delete Event](#delete-event)
5. [Sales-Rep Availability API](#sales-rep-availability-api)
   - [Get Availability Slots for Current Week](#get-availability-slots-for-current-week)
   - [Get Availability Slots for Specific Day](#get-availability-slots-for-specific-day)
   - [Backward Compatibility](#backward-compatibility)
6. [Data Models](#data-models)
   - [Event Model](#event-model)
   - [Availability Slot Model](#availability-slot-model)
7. [Error Handling](#error-handling)

## Overview

The API provides endpoints to manage events and retrieve sales representative availability slots. It uses Supabase as the database backend and follows RESTful principles.

## Base URL

```
/
```

## Authentication

Currently, all endpoints are publicly accessible. Authentication mechanisms may be implemented in future versions.

## Events API

The Events API allows for the management of events including creation, retrieval, updating, and deletion.

### Create Event

Creates a new event in the system with optional lead processing and record type assignment.

- **URL**: `/events`
- **Method**: `POST`
- **Required Fields**:
  - `Event_Type`: Type of the event
  - `Scheduled_Time`: Time when the event is scheduled (ISO format)
  - `Status`: Current status of the event
- **Optional Fields**:
  - `Lead_Data`: Object containing lead information (see Lead_Data Model below)
  - All other Event Model fields (see Event Model section below)
- **Picklist Fields**:
  - `Event_Type`: available values: `New Appointment`, `Rehash`, `Previous Reset`, `Follow Up`, `New Virtual Appointment`
  - `Status`: available values: `Scheduled`, `Confirmed`, `In-progress`, `Completed`, `Cancelled`, `No-show`, `Rescheduled`
  - `Result`: available values: `Unconfirmed`, `Follow up needed`, `Demo`, `No Sale`, `No Show`, `Cancelled`, `Follow up`, `Sold`, `Not Run`, `Rescheduled`, `Remote Signature`
  - `Product_Category`: available values: `Bathrooms`, `Kitchens`
  - `Result_Details`: available values: `Try to Reset`, `Do not Reset`, `Rescheduled by Rep`,`Price Objection`, `3rd Party Involvement`, `Other Estimates`, `Unsold Misc`, `No Money`, `Financing Reject`, `One leg`, `Lead not home`, `Out of Scope`, `Sold with contingency`, `Need additional homeowner`, `Need manager`, `Design`, `Future Project`, `BB Do Reset (our fault)`, `BB Do not Reset (our fault)`

**Request Body Example**:

```json
{
  "Event_Type": "New Appointment",
  "Scheduled_Time": "2025-04-18T09:38:00+00:00",
  "End_Time": "2025-04-18T11:38:00+00:00",
  "Status": "Scheduled",
  "Name": "Initial Consultation",
  "Duration_Minutes": 120,
  "Is_Virtual": false,
  "Address": "5 San Rosa Way Chelmsford, MA 01824 US",
  "Street": "5 San Rosa Way",
  "City": "Chelmsford",
  "State": "MA",
  "ZipCode": "01824",
  "Country": "US",
  "Notes": "Initial consultation for bathroom renovation",
  "Staff": "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
  "Lead_Data": {
    "First_Name": "John",
    "Last_Name": "Doe",
    "Email": "john.doe@example.com",
    "Phone": "+1234567890",
    "Address": "675 S Carondelet St, Los Angeles, CA 90057, USA",
    "Notes": "Interested in bathroom renovation",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "bathroom_renovation",
    "utm_content": "banner_ad",
    "campaign_id": "12345",
    "adset_id": "67890",
    "ad_id": "11111",
    "fbclid": "abc123",
    "gclid": "def456",
    "fbc": "facebook_cookie_value",
    "fcp": "facebook_cookie_value",
    "ga": "google_cookie_value",
    "wbraid": "wbraid_value",
    "gbraid": "gbraid_value",
    "extension_id": "ext123",
    "adgroup_id": "ag123",
    "asset_id": "asset123",
    "ad_type": "image",
    "network": "facebook",
    "rand": "random_value",
    "ip_address": "192.168.1.1",
    "User_Agent": "Mozilla/5.0..."
  }
}
```

**Success Response**:

- **Code**: 201 Created
- **Content Example**:

```json
{
  "Id": "1234-5678-90ab-cdef",
  "Event_Type": "New Appointment",
  "Scheduled_Time": "2025-04-18T09:38:00+00:00",
  "End_Time": "2025-04-18T11:38:00+00:00",
  "Status": "Scheduled",
  "Name": "Initial Consultation",
  "Duration_Minutes": 120,
  "Is_Virtual": false,
  "Address": "5 San Rosa Way Chelmsford, MA 01824 US",
  "Street": "5 San Rosa Way",
  "City": "Chelmsford",
  "State": "MA",
  "ZipCode": "01824",
  "Country": "US",
  "Notes": "Initial consultation for bathroom renovation",
  "Staff": "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
  "Customer": "abcd-efgh-ijkl-mnop",
  "Created_At": "2025-04-18T09:45:00Z",
  "Updated_At": "2025-04-18T09:45:00Z",
  "Lead_Processed": true,
  "Record_Type_Processed": true
}
```

**Response Fields for Lead Processing**:
- `Lead_Processed`: Boolean indicating if lead data was processed (true if Lead_Data was provided and processed successfully)
- `Customer`: UUID of the lead/customer associated with the event (set from processed lead or provided Lead_Data.Id)

**Response Fields for Record Type Processing**:
- `Record_Type_Processed`: Boolean indicating if record type was found and processed (true if "Sales Appointment" record type was found)

**Lead Processing Logic**:

When `Lead_Data` is provided in the create event request, the system follows this logic:

1. **Validate Lead_Data**: Ensures First_Name, Last_Name, Email, and Phone are provided
2. **Search for existing lead**: Looks for existing lead by Email or Phone
3. **If existing lead found**: Updates the existing lead with new data and uses its ID
4. **If no existing lead found**: Creates a new lead and uses the new ID
5. **Set Event Customer field**: Uses the resolved lead ID as the Customer value

**Record Type Processing**:

The system automatically attempts to find and assign a "Sales Appointment" record type from the `crm_settings.Record_Types` table where `Table = 'Events'` and `Name = 'Sales Appointment'`.

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Event_Type, Scheduled_Time, and Status are required" }`
  - **Content**: `{ "error": "Lead processing error: Lead_Data requires First_Name, Last_Name, Email, and Phone fields" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to create event, no data returned" }`

### Get All Events

Retrieves all events from the system.

- **URL**: `/events`
- **Method**: `GET`

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
[
  {
    "Id": "1234-5678-90ab-cdef",
    "Event_Type": "New Appointment",
    "Scheduled_Time": "2025-05-15T14:00:00Z",
    "End_Time": "2025-05-15T16:00:00Z",
    "Status": "Scheduled",
    "Staff": "12345",
    "Customer": "67890",
    "Notes": "Initial consultation",
    "Created_At": "2025-05-13T09:45:00Z",
    "Updated_At": "2025-05-13T09:45:00Z"
  },
  {
    "Id": "abcd-efgh-ijkl-mnop",
    "Event_Type": "Follow-up",
    "Scheduled_Time": "2025-05-16T10:00:00Z",
    "End_Time": "2025-05-16T11:30:00Z",
    "Status": "Pending",
    "Staff": "12345",
    "Customer": "67890",
    "Notes": "Follow-up discussion",
    "Created_At": "2025-05-13T10:15:00Z",
    "Updated_At": "2025-05-13T10:15:00Z"
  }
]
```

### Get Event by ID

Retrieves a specific event by its ID.

- **URL**: `/events/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: ID of the event to retrieve

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "Id": "1234-5678-90ab-cdef",
  "Event_Type": "New Appointment",
  "Scheduled_Time": "2025-05-15T14:00:00Z",
  "End_Time": "2025-05-15T16:00:00Z",
  "Status": "Scheduled",
  "Staff": "12345",
  "Customer": "67890",
  "Notes": "Initial consultation",
  "Created_At": "2025-05-13T09:45:00Z",
  "Updated_At": "2025-05-13T09:45:00Z"
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Event ID is required" }`
- **Code**: 404 Not Found
  - **Content**: `{ "error": "Event not found" }`

### Update Event

Updates an existing event by its ID.

- **URL**: `/events/:id`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: ID of the event to update

**Request Body Example**:

```json
{
  "Status": "Completed",
  "Notes": "Initial consultation completed successfully"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "Id": "1234-5678-90ab-cdef",
  "Event_Type": "New Appointment",
  "Scheduled_Time": "2025-05-15T14:00:00Z",
  "End_Time": "2025-05-15T16:00:00Z",
  "Status": "Completed",
  "Staff": "12345",
  "Customer": "67890",
  "Notes": "Initial consultation completed successfully",
  "Created_At": "2025-05-13T09:45:00Z",
  "Updated_At": "2025-05-13T11:30:00Z"
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Event ID is required" }` or `{ "error": "No update data provided" }`
- **Code**: 404 Not Found
  - **Content**: `{ "error": "Event not found or no changes made" }`

### Delete Event

Deletes an event by its ID.

- **URL**: `/events/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: ID of the event to delete

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "message": "Event deleted successfully",
  "deletedEvent": {
    "Id": "1234-5678-90ab-cdef",
    "Event_Type": "New Appointment",
    "Scheduled_Time": "2025-05-15T14:00:00Z",
    "End_Time": "2025-05-15T16:00:00Z",
    "Status": "Completed",
    "Staff": "12345",
    "Customer": "67890",
    "Notes": "Initial consultation completed successfully",
    "Created_At": "2025-05-13T09:45:00Z",
    "Updated_At": "2025-05-13T11:30:00Z"
  }
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Event ID is required" }`
- **Code**: 404 Not Found
  - **Content**: `{ "error": "Event not found" }`

## Sales-Rep Availability API

The Sales-Rep Availability API provides endpoints to retrieve availability slots for sales representatives.

### Get Availability Slots for Current Week

Retrieves availability slots for all active sales representatives for the current week. The endpoint automatically filters out time slots that conflict with existing appointments, including multi-day appointments.

- **URL**: `/sales-rep-availability/current-week`
- **Method**: `GET`

### Get Availability Slots for Specific Day

Retrieves availability slots for all active sales representatives for a specific day. The endpoint automatically filters out time slots that conflict with existing appointments, including multi-day appointments. It returns availability based on the day of the week configuration (e.g., if the specified date is a Wednesday, it returns the sales rep's Wednesday availability).

- **URL**: `/sales-rep-availability/day=:day`
- **Method**: `GET`
- **URL Parameters**:
  - `day`: Date in YYYY-MM-DD format (e.g., 2025-06-18)

**Example Request**:
```
GET /sales-rep-availability/day=2025-06-18
```

**Success Response**:
- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "message": "Availability slots for 2025-06-18 retrieved successfully",
  "data": [
    {
      "userId": "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
      "userName": "John Doe",
      "capabilities": ["Kitchen", "Bathroom"],
      "availability": [
        {
          "day": "2025-06-18",
          "slots": ["10:00:00", "14:00:00", "18:00:00"]
        }
      ]
    }
  ]
}
```

**Error Response**:
- **Code**: 400 Bad Request
  - **Content**: `{ "success": false, "message": "Invalid day format. Please use YYYY-MM-DD format (e.g., 2025-06-12)" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Server error", "error": "Error message details" }`

### Backward Compatibility

For backward compatibility, the original endpoint is still supported and redirects to the current-week endpoint:

- **URL**: `/sales-rep-availability`
- **Method**: `GET`
- **Behavior**: Redirects to `/sales-rep-availability/current-week`

**Multi-day Appointment Handling**:

When calculating availability slots, the system handles appointments that span multiple days as follows:
- For the appointment start date: All slots at or after the appointment start time are marked as unavailable
- For intermediate days (days between start and end dates): All slots for the entire day are marked as unavailable
- For the appointment end date: All slots before the appointment end time are marked as unavailable

**Success Response for Current Week**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "message": "Availability slots retrieved successfully",
  "data": [
    {
      "userId": "12345",
      "userName": "John Doe",
      "capabilities": ["Residential", "Commercial"],
      "availability": [
        {
          "day": "2025-05-13",
          "slots": ["09:00:00", "10:00:00", "11:00:00", "14:00:00", "15:00:00"]
        },
        {
          "day": "2025-05-14",
          "slots": ["10:00:00", "11:00:00", "13:00:00", "14:00:00"]
        }
      ]
    },
    {
      "userId": "67890",
      "userName": "Jane Smith",
      "capabilities": ["Residential", "Solar"],
      "availability": [
        {
          "day": "2025-05-15",
          "slots": ["09:00:00", "10:00:00", "15:00:00", "16:00:00"]
        },
        {
          "day": "2025-05-16",
          "slots": ["11:00:00", "13:00:00", "14:00:00"]
        }
      ]
    }
  ]
}
```

**Error Response**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "message": "Server error", "error": "Error message details" }`

## Data Models

### Lead_Data Model

The Lead_Data object contains information about a lead that can be associated with an event. When provided, the system will automatically process the lead data and link it to the event.

| Field                | Type        | Required | Description                                                            |
|----------------------|-------------|----------|------------------------------------------------------------------------|
| First_Name           | String      | Yes      | First name of the lead                                                 |
| Last_Name            | String      | Yes      | Last name of the lead                                                  |
| Email                | String      | Yes      | Email address of the lead                                              |
| Phone                | String      | Yes      | Phone number of the lead                                               |
| Address              | String      | No       | Full address in format "675 S Carondelet St, Los Angeles, CA 90057, USA" |
| Notes                | String      | No       | Additional notes about the lead                                        |
| utm_source           | String      | No       | UTM source parameter                                                   |
| utm_medium           | String      | No       | UTM medium parameter                                                   |
| utm_campaign         | String      | No       | UTM campaign parameter                                                 |
| utm_content          | String      | No       | UTM content parameter                                                  |
| campaign_id          | String      | No       | Campaign ID                                                            |
| adset_id             | String      | No       | Ad set ID                                                              |
| ad_id                | String      | No       | Ad ID                                                                  |
| fbclid               | String      | No       | Facebook click ID                                                      |
| gclid                | String      | No       | Google click ID                                                        |
| fbc                  | String      | No       | Facebook cookie value                                                  |
| fcp                  | String      | No       | Facebook cookie value                                                  |
| ga                   | String      | No       | Google Analytics cookie value                                          |
| wbraid               | String      | No       | Web browser referrer attribution ID                                    |
| gbraid               | String      | No       | Google browser referrer attribution ID                                 |
| extension_id         | String      | No       | Extension ID                                                           |
| adgroup_id           | String      | No       | Ad group ID                                                            |
| asset_id             | String      | No       | Asset ID                                                               |
| ad_type              | String      | No       | Type of advertisement                                                  |
| network              | String      | No       | Advertising network                                                    |
| rand                 | String      | No       | Random value                                                           |
| ip_address           | String      | No       | IP address of the lead                                                 |
| User_Agent           | String      | No       | User agent string                                                      |

**Important Notes**:
- The `Id` field is not accepted in Lead_Data as the system automatically handles lead creation/updating
- The system will search for existing leads by Email or Phone and update them if found
- If no existing lead is found, a new lead will be created
- The processed lead ID will be automatically assigned to the Event's `Customer` field

### Event Model

| Field                | Type        | Description                                                            |
|----------------------|-------------|------------------------------------------------------------------------|
| Id                   | UUID        | Unique identifier for the event                                        |
| Name                 | String      | Name of the event                                                      |
| Event_Type           | String      | Type of event (see Picklist Fields below)                              |
| Scheduled_Time       | TIMESTAMPTZ | When the event is scheduled (ISO format)                               |
| End_Time             | TIMESTAMPTZ | When the event ends (ISO format) - used for multi-day appointments     |
| Duration_Minutes     | Integer     | Duration of the event in minutes                                       |
| Status               | String      | Current status of the event (see Picklist Fields)                      |
| Result               | String      | Outcome of the event (see Picklist Fields)                             |
| Product_Category     | String      | Category of product discussed in the event (see Picklist Fields below) |
| Is_Virtual           | Boolean     | Whether the event is virtual or in-person                              |
| Address              | String      | Full address where the event takes place                               |
| Street               | String      | Street address component                                               |
| City                 | String      | City component of the address                                          |
| State                | String      | State/province component of the address                                |
| ZipCode              | String      | Postal/ZIP code component of the address                               |
| Country              | String      | Country component of the address                                       |
| Latitude             | String      | Geographical latitude of the event location                            |
| Longitude            | String      | Geographical longitude of the event location                           |
| Meeting_Url          | String      | URL for virtual meetings                                               |
| Notes                | String      | General notes about the event                                          |
| Notes_for_Sales_Rep  | String      | Specific notes for the sales representative                            |
| Appointment_Comments | String      | Comments related to the appointment                                    |
| Result_Details       | String      | Detailed information about the event result (see Picklist Fields below)|
| Staff                | UUID        | ID of the User assigned to the event                                   |
| Customer             | UUID        | ID of the Customer associated with the event (auto-set from Lead_Data processing) |
| Customer_Name        | String      | Name of the Customer                                                   |
| Related_Entity       | UUID        | ID of a related entity (e.g., opportunity, project)                    |
| Related_Entity_Type  | String      | Type of the related entity                                             |
| Sale                 | UUID        | ID of the associated Sale if applicable                                |
| Reminder_Sent        | Boolean     | Whether a reminder was sent for this event                             |
| Follow_Up_Date       | TIMESTAMPTZ | Date for any follow-up actions                                         |
| Created_At           | TIMESTAMPTZ | When the event was created (auto-generated)                            |
| Updated_At           | TIMESTAMPTZ | When the event was last updated (auto-generated)                       |
| Created_By           | UUID        | ID of the user who created the event                                   |
| Updated_By           | UUID        | ID of the user who last updated the event                              |
| Record_Type          | UUID        | ID of the Record_Type from crm_settings.Record_Types table (auto-assigned for "Sales Appointment") |
| Salesforce_Id        | String      | Associated Salesforce ID if integrated                                 |

**Picklist Fields**:
- `Event_Type`: available values: `New Appointment`, `Rehash`, `Previous Reset`, `Follow Up`, `New Virtual Appointment`
- `Status`: available values: `Scheduled`, `Confirmed`, `In-progress`, `Completed`, `Cancelled`, `No-show`, `Rescheduled`
- `Result`: available values: `Unconfirmed`, `Follow up needed`, `Demo`, `No Sale`, `No Show`, `Cancelled`, `Follow up`, `Sold`, `Not Run`, `Rescheduled`, `Remote Signature`
- `Product_Category`: available values: `Bathrooms`, `Kitchens`
- `Result_Details`: available values: `Try to Reset`, `Do not Reset`, `Rescheduled by Rep`,`Price Objection`, `3rd Party Involvement`, `Other Estimates`, `Unsold Misc`, `No Money`, 
                    `Financing Reject`, `One leg`, `Lead not home`, `Out of Scope`, `Sold with contingency`, `Need additional homeowner`, `Need manager`, `Design`, `Future Project`,
                    `BB Do Reset (our fault)`, `BB Do not Reset (our fault)`

**Auto-Generated Fields**:
- `Created_At`: Automatically set to current timestamp when creating an event
- `Updated_At`: Automatically set to current timestamp when creating or updating an event
- `Customer`: Automatically set from processed Lead_Data (if provided)
- `Record_Type`: Automatically assigned if "Sales Appointment" record type is found in crm_settings.Record_Types table
### Availability Slot Model

The availability slots are structured as follows:

- **User Availability**:
  - `userId`: Unique identifier for the sales representative
  - `userName`: Name of the sales representative
  - `capabilities`: Array of project categories/capabilities the sales rep handles
  - `availability`: Array of daily availability objects
    - `day`: Date in YYYY-MM-DD format
    - `slots`: Array of available time slots in HH:MM:SS format

**Availability Calculation**:

Availability slots are calculated based on:
1. The sales representative's configured availability schedule
2. Existing appointments in the system
3. Conflict detection with both single-day and multi-day appointments

For multi-day appointments, the system ensures that all affected time slots across the entire appointment duration are properly marked as unavailable, preventing double-booking.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- **200 OK**: The request was successful
- **201 Created**: The resource was successfully created
- **400 Bad Request**: The request was malformed or missing required parameters
- **404 Not Found**: The requested resource was not found
- **500 Internal Server Error**: An error occurred on the server

Error responses include a JSON object with an `error` field containing a description of the error.