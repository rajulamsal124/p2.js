declare module '@graphql-mesh/runtime' {
  export class GraphQLMesh {
    constructor(config: any);
    execute(query: string, variables?: Record<string, any>): Promise<any>;
  }
}

declare module '@graphql-mesh/types' {
  export interface Transform {
    name: string;
    config?: Record<string, any>;
  }

  export interface MeshConfig {
    sources: Array<{
      name: string;
      handler: {
        graphql: {
          endpoint: string;
        };
      };
    }>;
    transforms?: Transform[];
  }
}
