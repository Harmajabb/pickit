import type { RequestHandler } from "express";
import borrowRepository from "./borrowRepository";

// Interface aligned with what your JWT token actually contains (as seen in your authActions)
interface AuthenticatedRequest extends Request {
  auth?: {
    sub: number; // Ton ID est ici !
    role: number;
    firstname: string;
  };
}

const browseByOwner: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as unknown as AuthenticatedRequest;

    const ownerId = authReq.auth?.sub;

    console.log("Recherche des emprunts pour l'Owner ID :", ownerId);

    if (!ownerId) {
      res
        .status(401)
        .json({ message: "Utilisateur non identifié. Vérifiez la session." });
      return;
    }

    const borrows = await borrowRepository.readAllByOwner(ownerId);

    console.log(
      `Nombre de demandes trouvées en base : ${Array.isArray(borrows) ? borrows.length : 0}`,
    );

    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

const editStatus: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    console.log(`Mise à jour de la demande ${id} vers le statut : ${status}`);

    const result = await borrowRepository.updateStatus(id, status);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Demande introuvable." });
    } else {
      res.json({ message: `Statut mis à jour : ${status}` });
    }
  } catch (err) {
    next(err);
  }
};

export default { browseByOwner, editStatus };
