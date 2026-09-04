# Rent Ease BD — Backend

Spring Boot REST API for the **Digital Housing Platform** (CSE 370 project).  
Serves JSON to the React frontend over a cookie-based HTTP session.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Java 25 | Language |
| Spring Boot 4.1 | Application framework |
| Spring Web MVC | REST controllers |
| Spring Data JPA | ORM / repository layer |
| Hibernate | JPA provider |
| MySQL | Relational database |
| Maven | Build tool |

---

## Project Structure

```
src/main/java/com/example/digitalhousingplatform/
│
├── DigitalhousingplatformApplication.java   # Spring Boot entry point
│
├── config/
│   └── WebConfig.java                       # CORS configuration
│
├── controller/
│   ├── AuthController.java                  # POST /api/auth/signup, login, logout; GET /api/auth/me
│   ├── UserController.java                  # GET/DELETE /api/users
│   ├── LandlordController.java              # GET/DELETE /api/landlords
│   ├── TenantController.java                # GET/DELETE /api/tenants
│   ├── PropertyController.java              # CRUD /api/properties (date validation)
│   ├── JoinCodeController.java              # /api/joincodes — generate, join, revoke
│   ├── HasTenancyController.java            # /api/hastenancies — create, leave
│   ├── RatesTenantController.java           # /api/ratestenants — eligibility-gated ratings
│   ├── RatesLandlordController.java         # /api/rateslandlords — eligibility-gated ratings
│   ├── AnnouncementController.java          # /api/announcements (composite key)
│   ├── ComplaintController.java             # /api/complaints (composite key)
│   ├── BillController.java                  # /api/bills
│   └── BillShareController.java             # /api/billshares — create, pay, delete
│
├── model/
│   ├── User.java
│   ├── Landlord.java
│   ├── Tenant.java
│   ├── Property.java
│   ├── JoinCode.java
│   ├── HasTenancy.java
│   ├── RatesTenant.java
│   ├── RatesLandlord.java
│   ├── Announcement.java
│   ├── Complaint.java
│   ├── Bill.java
│   └── BillShare.java
│
└── repository/
    └── *Repository.java                     # Spring Data JPA interfaces for each model
```

---

## REST API Overview

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user (creates User + role row) |
| POST | `/api/auth/login` | Authenticate and set session cookie |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Return the currently authenticated user |

### Users — `/api/users`
| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get a user by ID |
| DELETE | `/api/users/{id}` | Delete a user |

### Landlords — `/api/landlords`
| Method | Path | Description |
|---|---|---|
| GET | `/api/landlords` | List all landlords |
| GET | `/api/landlords/{id}` | Get landlord by ID |
| DELETE | `/api/landlords/{id}` | Delete landlord |

### Tenants — `/api/tenants`
| Method | Path | Description |
|---|---|---|
| GET | `/api/tenants` | List all tenants |
| GET | `/api/tenants/{id}` | Get tenant by ID |
| DELETE | `/api/tenants/{id}` | Delete tenant |

### Properties — `/api/properties`
| Method | Path | Description |
|---|---|---|
| GET | `/api/properties` | List all properties |
| GET | `/api/properties/{id}` | Get property by ID |
| POST | `/api/properties` | Create property (rejects if expiryDate ≤ postedDate) |
| PUT | `/api/properties/{id}` | Update property |
| DELETE | `/api/properties/{id}` | Delete property |

### Join Codes — `/api/joincodes`
| Method | Path | Description |
|---|---|---|
| GET | `/api/joincodes` | List all join codes |
| GET | `/api/joincodes/{id}` | Get join code by ID |
| POST | `/api/joincodes/generate` | Generate a reusable join code for a property |
| POST | `/api/joincodes/join` | Tenant redeems a code → validates eligibility + creates tenancy |
| POST | `/api/joincodes` | Manual create (admin/testing only) |
| DELETE | `/api/joincodes/{id}` | Delete (revoke) a join code |

### Tenancies — `/api/hastenancies`
| Method | Path | Description |
|---|---|---|
| GET | `/api/hastenancies` | List all tenancy records |
| POST | `/api/hastenancies` | Directly create a tenancy |
| PUT | `/api/hastenancies/leave` | Tenant leaves a property (sets leaveDate) |

### Tenant Ratings — `/api/ratestenants`
| Method | Path | Description |
|---|---|---|
| GET | `/api/ratestenants` | List all tenant ratings |
| GET | `/api/ratestenants/{id}` | Get rating by ID |
| POST | `/api/ratestenants` | Create rating (tenant must have left the landlord's property) |
| DELETE | `/api/ratestenants/{id}` | Delete rating |

### Landlord Ratings — `/api/rateslandlords`
| Method | Path | Description |
|---|---|---|
| GET | `/api/rateslandlords` | List all landlord ratings |
| GET | `/api/rateslandlords/{id}` | Get rating by ID |
| GET | `/api/rateslandlords/tenant/{tenantId}` | Get ratings made by a specific tenant |
| POST | `/api/rateslandlords` | Create rating (tenant must have left the landlord's property) |
| DELETE | `/api/rateslandlords/{id}` | Delete rating |

### Announcements — `/api/announcements`
| Method | Path | Description |
|---|---|---|
| GET | `/api/announcements` | List all announcements |
| POST | `/api/announcements` | Create announcement |
| PUT | `/api/announcements/{propertyId}/{announcementId}` | Update announcement |
| DELETE | `/api/announcements/{propertyId}/{announcementId}` | Delete announcement |

### Complaints — `/api/complaints`
| Method | Path | Description |
|---|---|---|
| GET | `/api/complaints` | List all complaints |
| POST | `/api/complaints` | Create complaint |
| PUT | `/api/complaints/{propertyId}/{complaintId}` | Update complaint |
| DELETE | `/api/complaints/{propertyId}/{complaintId}` | Delete complaint |

### Bills — `/api/bills`
| Method | Path | Description |
|---|---|---|
| GET | `/api/bills` | List all bills |
| GET | `/api/bills/{id}` | Get bill by ID |
| POST | `/api/bills` | Create bill |
| DELETE | `/api/bills/{id}` | Delete bill |

### Bill Shares — `/api/billshares`
| Method | Path | Description |
|---|---|---|
| GET | `/api/billshares` | List all bill shares |
| GET | `/api/billshares/{id}` | Get share by ID |
| POST | `/api/billshares` | Create unpaid share (server sets paidStatus) |
| PUT | `/api/billshares/{id}/pay` | Mark share as paid (requires transactionId, irreversible) |
| DELETE | `/api/billshares/{id}` | Delete share (unpaid only) |

---

## Database Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3307/digitalhousingplatform
spring.datasource.username=root
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
```

> The default port is **3307** (not 3306). Adjust `spring.datasource.url` to match your local MySQL setup.

---

## Getting Started

### Prerequisites
- Java 25 (JDK)
- Maven 3.9+
- MySQL running on port 3307 with database `digitalhousingplatform` created

### Run

```bash
# From the backend/ directory
./mvnw spring-boot:run
```

The server starts on **http://localhost:8080**.

### Build JAR

```bash
./mvnw clean package
java -jar target/digitalhousingplatform-0.0.1-SNAPSHOT.jar
```

---

## CORS

Configured in `WebConfig.java` to allow requests from the Vite dev server (`http://localhost:5173`) with credentials.
