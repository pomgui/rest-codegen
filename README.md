
# OpenApi typescript code generator for PiRest

Another code generator from [OpenAPI-specification 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md).

The generated code uses the [pirest](https://github.com/pomgui/pirest) library as base for the REST services, which uses [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to improve the reading and writing of REST services source code.

**Note:** A full project structure ready to execute will be generated.

## Installation

Use npm to install pirest-codegen.

```bash
npm install -g pirest-codegen
```

## Usage

```
  picodegen [options] openapiSpec.yaml
Options:
--version, -v        Show the version of the tool
--config, -c         Configuration file containing all the following options
--file, -f           OpenApi/Swagger 2.0 file
--debug, -d          Print detailed messages for debug purposes
```

## Example

### OpenApi spec input

```yaml
...
/pet/findByStatus:
  get:
    tags:
    - "pet"
    summary: "Finds Pets by status"
    description: "Multiple status values can be provided with comma separated strings"
    operationId: "findPetsByStatus"
    produces:
    - "application/json"
    parameters:
    - name: "status"
    in: "query"
    description: "Status values that need to be considered for filter"
    required: true
    type: "array"
    items:
      type: "string"
      enum:
      - "available"
      - "pending"
      - "sold"
      default: "available"
    collectionFormat: "multi"
    responses:
    200:
      description: "successful operation"
      schema:
        type: "array"
        items:
          $ref: "#/definitions/Pet"
    400:
      description: "Invalid status value"
...
```

### Server generated code

#### Service

```typescript
/**    
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 */
@PiGET('/pet/findByStatus')
async findPetsByStatus(params: FindPetsByStatusParams): Promise<Pet[]> {
    if(/*condition*/false)
        throw new PiError('Invalid status value', 400);
    let value: Pet[] = <Pet[]> [];
    /* fill 'value' here */
    return value;
}
```

#### Parameter

```typescript
/** Parameters sent in the query */
export interface FindPetsByStatusParamsQuery  {
    /**    
     * Status values that need to be considered for filter
     */
    status: ('available'|'pending'|'sold')[];
}
/** Structure with ALL the operation parameters */
export interface FindPetsByStatusParams extends FindPetsByStatusParamsQuery { }
```

#### Model

```typescript
export interface Pet {
    id?: number;
    category?: Category;
    name: string;
    photoUrls: string[];
    tags?: Tag[];
    status?: 'available'|'pending'|'sold';
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to improve.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)