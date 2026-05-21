import { Injectable } from '@nestjs/common';

@Injectable()
export class NeuralNetworkService {
  generateResponse(prompt: string) {
    return Promise.resolve('Generated response for: ' + prompt);
  }
}
