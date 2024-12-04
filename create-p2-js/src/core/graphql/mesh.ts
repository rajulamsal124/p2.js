import { GraphQLMesh } from '@graphql-mesh/runtime';
import { MeshConfig } from '@graphql-mesh/types';

export class GraphQLMeshClient {
  private mesh: GraphQLMesh | null = null;
  private config: MeshConfig;

  constructor(config: MeshConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.mesh = new GraphQLMesh(this.config);
  }

  async execute<T>(query: string, variables?: Record<string, any>): Promise<T> {
    if (!this.mesh) {
      await this.initialize();
    }
    return this.mesh!.execute(query, variables);
  }
}

export const createMeshClient = (config: MeshConfig): GraphQLMeshClient => {
  return new GraphQLMeshClient(config);
};
