import categoryRepository from "../../modules/categories/categoryRepository";
import type { RequestHandler } from "express";

export interface CategoryTree {
  id: number;
  category: string;
  parent_id: number | null;
  children: CategoryTree[];
}

class CategoryAction {
  browse: RequestHandler = async (req, res, next) => {
    try {
      const categories = await categoryRepository.readAll();
      const categoryMap = new Map<number, CategoryTree>();
      categories.forEach((category) => {
        const node: CategoryTree = { ...category, children: [] };
        categoryMap.set(category.id, node);
      });

      const rootCategories: CategoryTree[] = [];
      categoryMap.forEach((node) => {
        if (node.parent_id) {
          const parentNode = categoryMap.get(node.parent_id);
          if (parentNode) {
            parentNode.children.push(node);
          }
        } else {
          rootCategories.push(node);
        }
      });

      res.json(rootCategories);
    } catch (err) {
      next(err);
    }
  };
  add: RequestHandler = async (req, res, next) => {
    try {
      const newCategory = {
        category: req.body.category,
        parent_id: req.body.parent_id || null,
      };
      const insertId = await categoryRepository.create(newCategory);
      res.status(201).json({ insertId });
    } catch (err) {
      next(err);
    }
  };
  edit: RequestHandler = async (req, res, next) => {
    try {
      const category = {
        id: Number(req.params.id),
        category: req.body.category,
        parent_id: req.body.parent_id || null,
      };
      const affectedRows = await categoryRepository.update(category);
      res.json({ affectedRows });
    } catch (err) {
      next(err);
    }
  };
    delete: RequestHandler = async (req, res, next) => {
    try {
      const categoryId = Number(req.params.id);
      const affectedRows = await categoryRepository.delete(categoryId);
      res.json({ affectedRows });
    } catch (err) {
      next(err);
    } 
    };
}
export default new CategoryAction();