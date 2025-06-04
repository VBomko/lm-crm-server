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
   - [Get Availability Slots](#get-availability-slots)
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

Creates a new event in the system.

- **URL**: `/events`
- **Method**: `POST`
- **Required Fields**:
  - `Event_Type`: Type of the event
  - `Scheduled_Time`: Time when the event is scheduled (ISO format)
  - `Status`: Current status of the event
- **Picklist Fields**:
  - `Event_Type`: available values: `Sales Appointment`, `Service Appointment`, `Follow Up`, `Customer Meeting`, `Installation, Other`
  - `Status`: available values: `Scheduled`, `Confirmed`, `In-progress`, `Completed`, `Cancelled`, `No-show`, `Rescheduled`
  - `Result`: available values: `Unconfirmed`, `Follow up needed`, `Demo`, `No Sale`, `No Show`, `Cancelled`, `Follow up`, `Sold`, `Not Run`, `Rescheduled`, `Remote Signature`
  - `Product_Category`: available values: `Bathrooms`, `Kitchens`
  - `Result_Details`: available values: `Try to Reset`, `Do not Reset`, `Rescheduled by Rep`,`Price Objection`, `3rd Party Involvement`, `Other Estimates`, `Unsold Misc`, `No Money`, `Financing Reject`, `One leg`, `Lead not home`, `Out of Scope`, `Sold with contingency`, `Need additional homeowner`, `Need manager`, `Design`, `Future Project`, `BB Do Reset (our fault)`, `BB Do not Reset (our fault)`

**Request Body Example**:

```json
    {
      "Created_At": "2025-04-18T09:38:57.313+00:00",
      "Updated_At": "2025-04-18T09:38:57.313+00:00",
      "Duration_Minutes": null,
      "Event_Type": "Sales Appointment",
      "Status": "Completed",
      "Result": "Sold",
      "Product_Category": "Bathrooms",
      "Is_Virtual": false,
      "Address": "5 San Rosa Way Chelmsford, MA 01824 US",
      "Meeting_Url": null,
      "Notes": null,
      "Customer": "4cfd3d71-a60b-438a-a110-5b8cd2062583",
      "Staff": "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
      "Related_Entity": null,
      "Related_Entity_Type": null,
      "Sale": "5bac26c8-78af-4dc9-b628-a6ae8d0ab373",
      "Customer_Name": null,
      "Reminder_Sent": null,
      "Follow_Up_Date": null,
      "Created_By": "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
      "Updated_By": "6d3fb306-6a41-439d-b3be-ba5a4c96c988",
      "Name": "Postman Test",
      "Scheduled_Time": "2025-04-18T09:38:00+00:00",
      "End_Time": "2025-04-18T11:38:00+00:00",
      "Salesforce_Id": null,
      "Street": "5 San Rosa Way",
      "City": "Chelmsford",
      "State": "MA",
      "ZipCode": "01824",
      "Result_Details": null,
      "Appointment_Comments": null,
      "Notes_for_Sales_Rep": null,
      "Country": null,
      "Latitude": null,
      "Longitude": null
    }
```

**Success Response**:

- **Code**: 201 Created
- **Content Example**:

```json
{
  "Id": "1234-5678-90ab-cdef",
  "Event_Type": "Appointment",
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
  - **Content**: `{ "error": "Event_Type, Scheduled_Time, and Status are required" }`
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
    "Event_Type": "Appointment",
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
  "Event_Type": "Appointment",
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
  "Event_Type": "Appointment",
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
    "Event_Type": "Appointment",
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

### Get Availability Slots

Retrieves availability slots for all active sales representatives for the current week. The endpoint automatically filters out time slots that conflict with existing appointments, including multi-day appointments.

- **URL**: `/sales-rep-availability`
- **Method**: `GET`

**Multi-day Appointment Handling**:

When calculating availability slots, the system handles appointments that span multiple days as follows:
- For the appointment start date: All slots at or after the appointment start time are marked as unavailable
- For intermediate days (days between start and end dates): All slots for the entire day are marked as unavailable
- For the appointment end date: All slots before the appointment end time are marked as unavailable

**Success Response**:

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
| Customer             | UUID        | ID of the Customer associated with the event                           |
| Customer_Name        | String      | Name of the Customer                                                   |
| Related_Entity       | UUID        | ID of a related entity (e.g., opportunity, project)                    |
| Related_Entity_Type  | String      | Type of the related entity                                             |
| Sale                 | UUID        | ID of the associated Sale if applicable                                |
| Reminder_Sent        | Boolean     | Whether a reminder was sent for this event                             |
| Follow_Up_Date       | TIMESTAMPTZ | Date for any follow-up actions                                         |
| Created_At           | TIMESTAMPTZ | When the event was created                                             |
| Updated_At           | TIMESTAMPTZ | When the event was last updated                                        |
| Created_By           | UUID        | ID of the user who created the event                                   |
| Updated_By           | UUID        | ID of the user who last updated the event                              |
| Salesforce_Id        | String      | Associated Salesforce ID if integrated                                 |

- **Picklist Fields**:
  - `Event_Type`: available values: `Sales Appointment`, `Service Appointment`, `Follow Up`, `Customer Meeting`, `Installation, Other`
  - `Status`: available values: `Scheduled`, `Confirmed`, `In-progress`, `Completed`, `Cancelled`, `No-show`, `Rescheduled`
  - `Result`: available values: `Unconfirmed`, `Follow up needed`, `Demo`, `No Sale`, `No Show`, `Cancelled`, `Follow up`, `Sold`, `Not Run`, `Rescheduled`, `Remote Signature`
  - `Product_Category`: available values: `Bathrooms`, `Kitchens`
  - `Result_Details`: available values: `Try to Reset`, `Do not Reset`, `Rescheduled by Rep`,`Price Objection`, `3rd Party Involvement`, `Other Estimates`, `Unsold Misc`, `No Money`, 
                      `Financing Reject`, `One leg`, `Lead not home`, `Out of Scope`, `Sold with contingency`, `Need additional homeowner`, `Need manager`, `Design`, `Future Project`,
                      `BB Do Reset (our fault)`, `BB Do not Reset (our fault)`
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