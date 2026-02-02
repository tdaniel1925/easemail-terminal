import Nylas from 'nylas';

let nylasInstance: Nylas | null = null;

function getNylasClient(): Nylas {
  if (!nylasInstance) {
    if (!process.env.NYLAS_API_KEY) {
      throw new Error('NYLAS_API_KEY environment variable is not set');
    }
    nylasInstance = new Nylas({
      apiKey: process.env.NYLAS_API_KEY,
    });
  }
  return nylasInstance;
}

export interface WebhookSetupOptions {
  webhookUrl: string;
  description?: string;
  triggers?: string[];
}

/**
 * Create a Nylas webhook for receiving real-time notifications
 * @param options Webhook configuration options
 */
export async function createNylasWebhook(options: WebhookSetupOptions) {
  const {
    webhookUrl,
    description = 'EaseMail Webhook',
    triggers = [
      'message.created',
      'message.updated',
      'message.deleted',
      'thread.updated',
      'calendar.created',
      'calendar.updated',
      'calendar.deleted',
      'event.created',
      'event.updated',
      'event.deleted',
    ],
  } = options;

  try {
    const nylas = getNylasClient();
    const webhook = await nylas.webhooks.create({
      requestBody: {
        description,
        webhookUrl,
        triggerTypes: triggers as any,
        notificationEmailAddresses: [], // Optional: email for webhook failures
      },
    });

    console.log('Webhook created successfully:', webhook.data.id);
    return { success: true, webhook: webhook.data };
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all configured webhooks
 */
export async function listNylasWebhooks() {
  try {
    const nylas = getNylasClient();
    const webhooks = await nylas.webhooks.list();
    return { success: true, webhooks: webhooks.data };
  } catch (error: any) {
    console.error('Error listing webhooks:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a webhook by ID
 */
export async function deleteNylasWebhook(webhookId: string) {
  try {
    const nylas = getNylasClient();
    await nylas.webhooks.destroy({ webhookId });
    console.log('Webhook deleted successfully:', webhookId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a webhook's configuration
 */
export async function updateNylasWebhook(
  webhookId: string,
  updates: Partial<WebhookSetupOptions>
) {
  try {
    const updateData: any = {};

    if (updates.description) {
      updateData.description = updates.description;
    }

    if (updates.webhookUrl) {
      updateData.webhookUrl = updates.webhookUrl;
    }

    if (updates.triggers) {
      updateData.triggerTypes = updates.triggers;
    }

    const nylas = getNylasClient();
    const webhook = await nylas.webhooks.update({
      webhookId,
      requestBody: updateData,
    });

    console.log('Webhook updated successfully:', webhookId);
    return { success: true, webhook: webhook.data };
  } catch (error: any) {
    console.error('Error updating webhook:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get webhook details by ID
 */
export async function getNylasWebhook(webhookId: string) {
  try {
    const nylas = getNylasClient();
    const webhook = await nylas.webhooks.find({ webhookId });
    return { success: true, webhook: webhook.data };
  } catch (error: any) {
    console.error('Error getting webhook:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Rotate webhook secret (for security)
 */
export async function rotateWebhookSecret(webhookId: string) {
  try {
    const nylas = getNylasClient();
    const result = await nylas.webhooks.rotateSecret({ webhookId });
    console.log('Webhook secret rotated successfully');
    return { success: true, secret: result.data.webhookSecret };
  } catch (error: any) {
    console.error('Error rotating webhook secret:', error);
    return { success: false, error: error.message };
  }
}
