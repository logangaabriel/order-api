import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';

@Injectable()
export class Bcrypt extends HashingService {
    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}