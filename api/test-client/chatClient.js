const controller = (() => {
    const baseUrl = 'https://codevalue-chat-api-app.victoriousglacier-061892a8.westeurope.azurecontainerapps.io';
    let adminCredentials = null;
    let currentChatId = null;
    let chatArea = null;
    let sendButton = null;

    document.addEventListener('DOMContentLoaded', function () {
        chatArea = document.getElementById('chatArea');
        sendButton = document.querySelector('button');

        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                controller.postMessage();
            }
        });
    });

    async function createChat() {
        try {
            const response = await fetch(`${baseUrl}/chat`, {
                method: 'POST',
            });
            const data = await response.json();
            document.getElementById('chatId').textContent = `Chat ID: ${data.chatId}`;
            currentChatId = data.chatId;
            return currentChatId;
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    }

    async function postMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value;

        chatArea.innerHTML += `<div class="user-message">You: ${message}</div>`;

        chatArea.innerHTML += `<div id="loader">Loading...</div>`;

        sendButton.disabled = true;

        try {
            const chatId = currentChatId || await createChat();
            const response = await fetch(`${baseUrl}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, message }),
            });

            const data = await response.json();

            // Remove loader and enable the "Send" button
            document.getElementById('loader').remove();
            sendButton.disabled = false;

            // Append chatbot's response to chat area
            chatArea.innerHTML += `<div class="bot-message">Bot: ${data.message}</div>`;

            // Clear the message input
            messageInput.value = '';
        } catch (error) {
            console.error('Error posting message:', error);

            // Remove loader and enable the "Send" button in case of an error
            document.getElementById('loader').remove();
            sendButton.disabled = false;
        }
    }

    function setCredentials() {
        const adminUsername = document.getElementById('adminUsername').value;
        const adminPassword = document.getElementById('adminPassword').value;
        adminCredentials = btoa(`${adminUsername}:${adminPassword}`);
    }

    async function uploadDocument() {
        const loaderElement = document.getElementById('uploadDocumentLoader');
        loaderElement.style.display = 'block';

        const fileInput = document.getElementById('documentInput');
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${baseUrl}/train/document`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${adminCredentials}`,
                },
                body: formData,
            });
            if (response.ok) {
                document.getElementById('uploadDocumentSuccess').textContent = 'Document uploaded successfully!';
            } else {
                document.getElementById('uploadDocumentSuccess').textContent = 'Document upload failed!';
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            document.getElementById('uploadDocumentSuccess').textContent = error.message;

        } finally {
            loaderElement.style.display = 'none';
        }
    }

    async function trainWebsite() {
        const loaderElement = document.getElementById('trainWebsiteLoader');
        loaderElement.style.display = 'block';

        const websiteUrlsInput = document.getElementById('websiteUrls');
        const urls = websiteUrlsInput.value.split(',');

        try {
            const response = await fetch(`${baseUrl}/train/website`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${adminCredentials}`,
                },
                body: JSON.stringify({ urls }),
            });
            if (response.ok) {
                document.getElementById('trainWebsiteSuccess').textContent = 'Website trained successfully!';
            } else {
                document.getElementById('trainWebsiteSuccess').textContent = 'Website training failed!';
            }

        } catch (error) {
            console.error('Error training website:', error);
            document.getElementById('trainWebsiteSuccess').textContent = error.message;

        } finally {
            loaderElement.style.display = 'none';
        }
    }

    return {
        postMessage,
        uploadDocument,
        trainWebsite,
        setCredentials
    };
})();
