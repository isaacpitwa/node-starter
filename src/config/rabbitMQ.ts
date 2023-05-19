import { Connection, Channel, connect } from 'amqplib';
import { logger } from './winston';

export class RabbitMQ {
    private connection!: Connection;
    private channel!: Channel;
    private url: string = process.env.RABBITMQ_URL || 'amqp://localhost';
    private queue: string = process.env.RABBITMQ_QUEUE || 'default';

    connect() {
        connect(this.url).then((conn) => {
            this.connection = conn;
            logger.log("info", `RabbitMQ: Connected to ${this.url}`);
            this.createChannel();
        }).catch((err) => {
            logger.log("error", `RabbitMQ: Failed to connect to ${this.url}, ${err}`);
        });
    }
    private createChannel() {
        this.connection.createChannel().then((ch) => {
            this.channel = ch;
            logger.log("info", `RabbitMQ: Created channel channel for ${this.url}`);
        }).catch((err) => {
            logger.log("error", `RabbitMQ: Failed to create channel for ${this.url}, ${err}`);
        });
    }

    async produce(message: string): Promise<void> {
        await this.channel.assertQueue(this.queue);
        this.channel.sendToQueue(this.queue, Buffer.from(message));
    }

    async consume(callback: (message: string) => void): Promise<void> {
        await this.channel.assertQueue(this.queue);
        this.channel.consume(this.queue, (message) => {
            if (message !== null) {
                callback(message.content.toString());
                this.channel.ack(message);
            }
        });
    }

    async close(): Promise<void> {
        await this.channel.close();
        await this.connection.close();
    }
}

export default new RabbitMQ();
