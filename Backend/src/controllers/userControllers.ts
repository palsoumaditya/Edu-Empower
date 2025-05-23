import { Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { Role } from "@prisma/client";
import { validateUserDataAndUpdate } from "../utils/userDetailsValidation";

export const registerOrUpdateUser = async (req: Request, res: Response) => {
  // Validate request body using Zod
  const validationResult = validateUserDataAndUpdate(req.body);
  if (!validationResult.success) {
    res.status(400).json({ errors: validationResult.error.format() });
    return;
  }

  const { userId, name, email, role } = validationResult.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (existingUser) {
      if (role && existingUser.role !== role) {
        res
          .status(403)
          .json({ error: "You cannot change your role after registration" });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, email },
      });

      res.status(200).json(updatedUser);
    } else {
      if (userId && name && email && role) {
        const newUser = await prisma.user.create({
          data: { id: userId, name, email, role },
        });
        res.status(201).json(newUser);
      }
    }
  } catch (error) {
    console.error("Error in registerOrUpdateUser:", error);
    res.status(500).json({ error: "User registration or update failed" });
    return;
  }
};

// Fetch a single user by ID
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        fundraisers: true,
        donations: true,
        scholarships: true,
        applications: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Fetch all users with optional role filtering
export const getAllUsers = async (req: Request, res: Response) => {
  const { role } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: role ? { role: role as Role } : {},
      include: {
        fundraisers: true,
        donations: true,
        scholarships: true,
        applications: true,
        disbursements: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Delete the user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
