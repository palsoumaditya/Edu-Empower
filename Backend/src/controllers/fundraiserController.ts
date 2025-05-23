import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import {
  validateCreateFundraiserDetails,
  validateUpdateFundraiserDetails,
} from "../utils/fundraiserDetailsValidation";

// Get all fundraisers
export const getFundraisers = async (req: Request, res: Response) => {
  try {
    const fundraisers = await prisma.fundraiser.findMany({
      include: {
        organization: true,
        donations: true,
        scholarships: true,
      },
    });

    res.status(200).json(fundraisers);
  } catch (error) {
    console.error("Error fetching fundraisers:", error);
    res.status(500).json({ error: "Failed to fetch fundraisers" });
  }
};

// Get a single fundraiser by ID
export const getFundraiserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const fundraiser = await prisma.fundraiser.findUnique({
      where: { id },
      include: {
        organization: true,
        donations: true,
        scholarships: true,
      },
    });

    if (!fundraiser) {
      res.status(404).json({ error: "Fundraiser not found" });
      return;
    }

    res.status(200).json(fundraiser);
  } catch (error) {
    console.error("Error fetching fundraiser:", error);
    res.status(500).json({ error: "Failed to fetch fundraiser" });
  }
};

// Create a new fundraiser
export const createFundraiser = async (req: Request, res: Response) => {
  const validationResult = validateCreateFundraiserDetails(req.body);
  if (!validationResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validationResult.error.format(),
    });
    return;
  }

  const {
    title,
    description,
    goalAmount,
    imageUrl,
    about,
    deadline,
    organizationId,
  } = validationResult.data;

  try {
    const newFundraiser = await prisma.fundraiser.create({
      data: {
        title,
        description,
        imageUrl,
        about,
        goalAmount,
        deadline: new Date(deadline),
        organizationId,
      },
    });

    res.status(201).json(newFundraiser);
  } catch (error) {
    console.error("Error creating fundraiser:", error);
    res.status(500).json({ error: "Failed to create fundraiser" });
  }
};

// Update a fundraiser
export const updateFundraiser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validationResult = validateUpdateFundraiserDetails(req.body);
  if (!validationResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validationResult.error.format(),
    });
    return;
  }
  const updateData = validationResult.data;

  try {
    const updatedFundraiser = await prisma.fundraiser.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedFundraiser);
  } catch (error) {
    console.error("Error updating fundraiser:", error);
    res.status(500).json({ error: "Failed to update fundraiser" });
  }
};

// Delete a fundraiser
export const deleteFundraiser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existingFundraiser = await prisma.fundraiser.findUnique({
      where: { id },
    });
    if (!existingFundraiser) {
      res.status(404).json({ error: "Fundraiser not found" });
      return;
    }

    await prisma.fundraiser.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting fundraiser:", error);
    res.status(500).json({ error: "Failed to delete fundraiser" });
  }
};
