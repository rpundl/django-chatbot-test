import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from . import tasks


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = "test"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()
        
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

#         response_message = 'Please type `help` for the list of the commands.'
#         message_parts = message.split()
#         if message_parts:
#             command = message_parts[0].lower()
#             if command == 'help':
#                 response_message = 'List of the available commands:\n' + '\n'.join([f'{command} - {params["help"]} ' for command, params in COMMANDS.items()])
#             elif command in COMMANDS:
#                 if len(message_parts[1:]) != COMMANDS[command]['args']:
#                     response_message = f'Wrong arguments for the command `{command}`.'
#                 else:
#                     getattr(tasks, COMMANDS[command]['task']).delay(self.channel_name, *message_parts[1:])
#                     print("Below is the task being activated for the requested operation")
#                     print(getattr(tasks, COMMANDS[command]['task']))
#                     response_message = f'Command `{command}` received.'
        
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat_message", "message": message}
        )
        async_to_sync(self.channel_layer.send)(
                self.channel_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )

    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))
