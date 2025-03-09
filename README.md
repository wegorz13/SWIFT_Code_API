# SWIFT Code API

## Setup

Start Docker Desktop and run:

```
docker-compose up --build
```

To do tests run:

```
npx jest
```

## Endpoints

All endpoints are available at localhost:8080

### Endpoint 1: Retrieve details of a single SWIFT code whether for a headquarters or branches

GET: /v1/swift-codes/{swift-code}  
Response Structure for headquarter swift code:

```json
{
    "address": string,
    "bankName": string,
    "countryISO2": string,
    "countryName": string,
    "isHeadquarter": bool,
    "swiftCode": string
    "branches": [
{
"address": string,
"bankName": string,
"countryISO2": string,
"isHeadquarter": bool,
"swiftCode": string
},
{
"address": string,
"bankName": string,
"countryISO2": string,
"isHeadquarter": bool,
"swiftCode": string
}, . . .
]
}
```

Response Structure for branch swift code:

```json
{
    "address": string,
    "bankName": string,
    "countryISO2": string,
    "countryName": string,
    "isHeadquarter": bool,
    "swiftCode": string
}
```

### Endpoint 2: Return all SWIFT codes with details for a specific country (both headquarters and branches).

GET: /v1/swift-codes/country/{countryISO2code}  
Response Structure:

```json
{
    "countryISO2": string,
    "countryName": string,
    "swiftCodes": [
        {
            "address": string,
    		 "bankName": string,
    		 "countryISO2": string,
    		 "isHeadquarter": bool,
    		 "swiftCode": string
        },
        {
            "address": string,
    		 "bankName": string,
    		 "countryISO2": string,
    		 "isHeadquarter": bool,
    		 "swiftCode": string
        }, . . .
    ]
}
```

### Endpoint 3: Adds new SWIFT code entries to the database for a specific country.

POST: /v1/swift-codes  
Request Structure:

```json
	{
    "address": string,
    "bankName": string,
    "countryISO2": string,
    "countryName": string,
    “isHeadquarter”: bool,
    "swiftCode": string,
}
```

Response Structure:

```json
{
    "message": string,
}
```

### Endpoint 4: Deletes swift-code data if swiftCode matches the one in the database.

DELETE: /v1/swift-codes/{swift-code}  
Response Structure:

```json
{
    "message": string,
}
```
