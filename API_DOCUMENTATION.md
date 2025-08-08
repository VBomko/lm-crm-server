# Sales-Rep Availability and Events API Documentation

This document provides comprehensive documentation for the Sales-Rep Availability and Events API endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
   - [Login](#login)
   - [Refresh Token](#refresh-token)
   - [Logout](#logout)
   - [Verify Token](#verify-token)
   - [Protected Routes](#protected-routes)
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
   - [User Model](#user-model)
7. [Error Handling](#error-handling)

## Overview

The API provides endpoints to manage events and retrieve sales representative availability slots. It uses Supabase as the database backend and follows RESTful principles. The API implements JWT-based authentication for secure access to protected endpoints.

## Base URL

```
/
```

## Authentication

The API uses JWT (JSON Web Token) based authentication with access and refresh tokens. Most endpoints require authentication via the `Authorization` header.

### Authentication Flow

1. **Login**: User provides email and password to receive access and refresh tokens
2. **Access**: Use the access token in the `Authorization` header for API requests
3. **Refresh**: When the access token expires, use the refresh token to get a new access token
4. **Logout**: Invalidate the refresh token to log out

### Token Types

- **Access Token**: Short-lived (15 minutes) token for API access
- **Refresh Token**: Long-lived (7 days) token for refreshing access tokens

### Headers

For authenticated requests, include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Authentication API

### Login

Authenticates a user and returns access and refresh tokens.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Required Fields**:
  - `email`: User's email address
  - `password`: User's password

**Request Body Example**:

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "refreshTokenExpiresIn": 604800,
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "success": false, "error": "Email and password are required" }`
- **Code**: 401 Unauthorized
  - **Content**: `{ "success": false, "error": "Invalid email or password" }`
  - **Content**: `{ "success": false, "error": "Your account is disabled. Please contact support." }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "error": "Internal server error" }`

### Refresh Token

Refreshes an expired access token using a valid refresh token.

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Authentication**: Refresh token (sent as HTTP-only cookie)

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "refreshTokenExpiresIn": 604800
}
```

**Error Responses**:

- **Code**: 401 Unauthorized
  - **Content**: `{ "success": false, "error": "Refresh token not found" }`
  - **Content**: `{ "success": false, "error": "Invalid or expired refresh token" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "error": "Internal server error" }`

### Logout

Logs out the user by invalidating the refresh token.

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Authentication**: Refresh token (sent as HTTP-only cookie)

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Response**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "error": "Internal server error" }`

### Verify Token

Verifies the validity of an access token and returns user information.

- **URL**: `/auth/verify`
- **Method**: `GET`
- **Authentication**: Access token in Authorization header

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "user": {
    "userId": "12345",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses**:

- **Code**: 401 Unauthorized
  - **Content**: `{ "success": false, "error": "Access token required" }`
  - **Content**: `{ "success": false, "error": "Invalid or expired token" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "success": false, "error": "Internal server error" }`

### Protected Routes

Example of a protected route that requires authentication:

- **URL**: `/auth/protected/user`
- **Method**: `GET`
- **Authentication**: Access token in Authorization header

**Success Response**:

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "message": "Protected route accessed successfully",
  "user": {
    "userId": "12345",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Response**:

- **Code**: 401 Unauthorized
  - **Content**: `{ "success": false, "error": "Access token required" }`
  - **Content**: `{ "success": false, "error": "Invalid or expired token" }`

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

### User Model

The User model represents authenticated users in the system.

| Field                | Type        | Description                                                            |
|----------------------|-------------|------------------------------------------------------------------------|
| Id                   | UUID        | Unique identifier for the user                                         |
| Email                | String      | User's email address (used for login)                                  |
| First_Name           | String      | User's first name                                                      |
| Last_Name            | String      | User's last name                                                       |
| Password             | String      | Hashed password (bcrypt)                                               |
| Can_Login            | Boolean     | Whether the user account is enabled for login                          |
| Created_At           | TIMESTAMPTZ | When the user was created (auto-generated)                            |
| Updated_At           | TIMESTAMPTZ | When the user was last updated (auto-generated)                       |

**Authentication Features**:

- **Password Hashing**: Passwords are automatically hashed using bcrypt when stored
- **Account Status**: Users can be disabled by setting `Can_Login` to false
- **Email Normalization**: Email addresses are automatically converted to lowercase for consistency
- **Legacy Password Support**: The system supports both hashed and plain text passwords (with automatic migration to hashed)

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- **200 OK**: The request was successful
- **201 Created**: The resource was successfully created
- **400 Bad Request**: The request was malformed or missing required parameters
- **401 Unauthorized**: Authentication required or invalid credentials/tokens
- **404 Not Found**: The requested resource was not found
- **500 Internal Server Error**: An error occurred on the server

### Authentication Error Codes

- **401 Unauthorized**: 
  - Missing or invalid access token
  - Expired access token
  - Invalid refresh token
  - Disabled user account
  - Invalid email or password

### Error Response Format

Error responses include a JSON object with the following structure:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

For authentication errors, the response may also include additional context:

```json
{
  "success": false,
  "error": "Invalid or expired token",
  "code": "TOKEN_EXPIRED"
}
```

## Security Considerations

### Environment Variables

The authentication system requires the following environment variables:

- `JWT_ACCESS_SECRET`: Secret key for signing access tokens (change in production)
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens (change in production)
- `NODE_ENV`: Set to 'production' for secure cookie settings

### Security Features

- **HTTP-Only Cookies**: Refresh tokens are stored in HTTP-only cookies to prevent XSS attacks
- **Secure Cookies**: In production, cookies are set with the `secure` flag for HTTPS-only transmission
- **Token Expiration**: Access tokens expire after 15 minutes, refresh tokens after 7 days
- **Password Hashing**: All passwords are hashed using bcrypt with salt
- **Account Locking**: Users can be disabled by setting `Can_Login` to false
- **CORS Protection**: Strict CORS settings prevent unauthorized cross-origin requests

### Best Practices

1. **Token Storage**: Store access tokens in memory or secure storage, never in localStorage
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **Logout**: Always call logout endpoint to invalidate refresh tokens
4. **HTTPS**: Use HTTPS in production to secure token transmission
5. **Secret Rotation**: Regularly rotate JWT secrets in production environments