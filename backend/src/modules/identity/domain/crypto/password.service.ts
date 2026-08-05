import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

// Volume 3, Part B1: "password with bcrypt hashing (cost factor 12+, never reversible)".
const BCRYPT_COST_FACTOR = 12;

@Injectable()
export class PasswordService {
  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, BCRYPT_COST_FACTOR);
  }

  async verify(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
