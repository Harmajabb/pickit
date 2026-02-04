// to make the file a module and avoid the TypeScript error
export type {};

declare global {
  namespace Express {
    export interface Request {
      /* ************************************************************************* */
      // Custom properties added by middlewares
      /* ************************************************************************* */

      // Added by authActions.checkAuth middleware
      user?: {
        id: number;
        email: string;
        role: number;
      };
    }
  }
}
