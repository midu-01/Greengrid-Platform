export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'GreenGrid Platform API',
    version: '1.0.0',
    description:
      'Interactive Urban Farming Platform backend APIs built with Express, Prisma, and PostgreSQL.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Base API prefix',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Vendors' },
    { name: 'Certifications' },
    { name: 'Rental Spaces' },
    { name: 'Produce' },
    { name: 'Orders' },
    { name: 'Community' },
    { name: 'Plant Tracking' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Request successful.' },
          data: { type: 'object', nullable: true },
          meta: { type: 'object', nullable: true },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed.' },
          error: {
            type: 'object',
            properties: {
              details: { nullable: true },
              code: { type: 'string', nullable: true },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Ava Khan' },
          email: { type: 'string', format: 'email', example: 'ava@example.com' },
          password: { type: 'string', example: 'Password@123' },
          role: {
            type: 'string',
            enum: ['CUSTOMER', 'VENDOR'],
            example: 'CUSTOMER',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@greengrid.local' },
          password: { type: 'string', example: 'Password@123' },
        },
      },
      AuthData: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['ADMIN', 'VENDOR', 'CUSTOMER'] },
              status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      VendorProfileRequest: {
        type: 'object',
        required: ['farmName', 'farmLocation'],
        properties: {
          farmName: { type: 'string', example: 'SkyLeaf Farms' },
          farmLocation: { type: 'string', example: 'Gulshan, Dhaka' },
        },
      },
      CertificationSubmitRequest: {
        type: 'object',
        required: ['certificationType', 'certifyingAgency', 'certificationDate'],
        properties: {
          certificationType: { type: 'string', enum: ['SUSTAINABILITY', 'ORGANIC'] },
          certifyingAgency: { type: 'string', example: 'Urban Green Council' },
          certificationNumber: { type: 'string', example: 'GG-1-2026' },
          certificationDate: { type: 'string', format: 'date-time' },
          documentUrl: { type: 'string', format: 'uri' },
        },
      },
      RentalSpaceRequest: {
        type: 'object',
        required: ['location', 'size', 'price'],
        properties: {
          location: { type: 'string', example: 'Dhanmondi, Dhaka - North Block' },
          size: { type: 'number', example: 150 },
          price: { type: 'number', example: 95 },
          availability: {
            type: 'string',
            enum: ['AVAILABLE', 'UNAVAILABLE', 'OCCUPIED'],
            example: 'AVAILABLE',
          },
        },
      },
      RentalBookingRequest: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      ProduceRequest: {
        type: 'object',
        required: ['name', 'description', 'price', 'category', 'availableQuantity'],
        properties: {
          name: { type: 'string', example: 'Cherry Tomato Batch 001' },
          description: {
            type: 'string',
            example: 'Fresh urban-grown cherry tomato with nutrient-monitored cultivation.',
          },
          price: { type: 'number', example: 5.25 },
          category: { type: 'string', example: 'Fruit Vegetables' },
          certificationStatus: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
          },
          availableQuantity: { type: 'integer', example: 120 },
        },
      },
      PlaceOrderRequest: {
        type: 'object',
        required: ['produceId', 'quantity'],
        properties: {
          produceId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', minimum: 1, example: 3 },
        },
      },
      UpdateOrderStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
            example: 'CONFIRMED',
          },
        },
      },
      CommunityPostRequest: {
        type: 'object',
        required: ['postContent'],
        properties: {
          postContent: {
            type: 'string',
            example: 'Weekly urban farm meetup starts Friday at 6 PM near Gulshan Lake.',
          },
        },
      },
      PlantTrackingRequest: {
        type: 'object',
        required: ['plantName', 'growthStage', 'healthStatus'],
        properties: {
          rentalBookingId: { type: 'string', format: 'uuid' },
          plantName: { type: 'string', example: 'Roma Tomato' },
          growthStage: {
            type: 'string',
            enum: ['SEED', 'SEEDLING', 'VEGETATIVE', 'FLOWERING', 'HARVEST_READY', 'HARVESTED'],
          },
          healthStatus: {
            type: 'string',
            enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL', 'DISEASED'],
          },
          expectedHarvestDate: { type: 'string', format: 'date-time' },
          notes: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a customer or vendor account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: {
                  success: true,
                  message: 'User registered successfully.',
                  data: {
                    user: {
                      id: 'f17da9d4-8adf-4f98-a234-7f26dd3e3f70',
                      name: 'Ava Khan',
                      email: 'ava@example.com',
                      role: 'CUSTOMER',
                      status: 'ACTIVE',
                      createdAt: '2026-04-16T08:00:00.000Z',
                    },
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User logged in successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/AuthData' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/vendors/me': {
      get: {
        tags: ['Vendors'],
        summary: 'Get own vendor profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Vendor profile fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Vendors'],
        summary: 'Create or update own vendor profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VendorProfileRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Vendor profile saved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/certifications': {
      post: {
        tags: ['Certifications'],
        summary: 'Submit sustainability certification (vendor)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CertificationSubmitRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Certification submitted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Certifications'],
        summary: 'List certifications (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
          { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'certificationType', in: 'query', schema: { type: 'string', enum: ['SUSTAINABILITY', 'ORGANIC'] } },
        ],
        responses: {
          '200': {
            description: 'Certifications fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/rental-spaces': {
      get: {
        tags: ['Rental Spaces'],
        summary: 'Public listing of available rental spaces',
        parameters: [
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'minSize', in: 'query', schema: { type: 'number' } },
          { name: 'maxSize', in: 'query', schema: { type: 'number' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          '200': {
            description: 'Available rental spaces fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: {
                  success: true,
                  message: 'Available rental spaces fetched successfully.',
                  data: [
                    {
                      id: '3ba64946-95a0-49cb-8ea3-733ac2e1203d',
                      location: 'Dhanmondi, Dhaka - North Block',
                      size: 150,
                      price: '95',
                      availability: 'AVAILABLE',
                    },
                  ],
                  meta: { total: 15 },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Rental Spaces'],
        summary: 'Create rental space (vendor)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RentalSpaceRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Rental space created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/rental-spaces/{id}/book': {
      post: {
        tags: ['Rental Spaces'],
        summary: 'Book rental space (customer)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RentalBookingRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Rental space booked',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/produce': {
      get: {
        tags: ['Produce'],
        summary: 'List produce with filtering and pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'certificationStatus', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Produce listings fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Produce'],
        summary: 'Create produce listing (vendor)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProduceRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Produce listing created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place produce order (customer)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlaceOrderRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Order placed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'List all orders (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'customerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Orders fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status (vendor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrderStatusRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Order status updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/community-posts': {
      get: {
        tags: ['Community'],
        summary: 'List community posts with pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Community posts fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Community'],
        summary: 'Create community post',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommunityPostRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Community post created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/plant-tracking': {
      get: {
        tags: ['Plant Tracking'],
        summary: 'List visible plant tracking records (vendor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'vendorId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'rentalBookingId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          {
            name: 'growthStage',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['SEED', 'SEEDLING', 'VEGETATIVE', 'FLOWERING', 'HARVEST_READY', 'HARVESTED'],
            },
          },
          {
            name: 'healthStatus',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL', 'DISEASED'],
            },
          },
          { name: 'updatedAfter', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          '200': {
            description: 'Plant tracking records fetched',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Plant Tracking'],
        summary: 'Create plant tracking record (customer)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlantTrackingRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Plant tracking record created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
        },
      },
    },
    '/plant-tracking/me/updates': {
      get: {
        tags: ['Plant Tracking'],
        summary: 'Incremental updates for customer polling',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'updatedAfter', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Plant tracking updates fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
                example: {
                  success: true,
                  message: 'Plant tracking updates fetched successfully.',
                  data: [],
                  meta: {
                    count: 0,
                    latestUpdatedAt: null,
                    serverTime: '2026-04-16T08:00:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
