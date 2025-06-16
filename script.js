// Configuración de la API
const apiUrl = "http://www.raydelto.org/agenda.php";

/**
 * Función para obtener todos los contactos desde la API
 * @returns {Array|null} Lista de contactos o null si hay error
 */
const fetchContacts = async () => {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching contacts: ", error);
        return null;
    }
};

/**
 * Función para agregar un nuevo contacto a la API
 * @param {Object} contact - Objeto con nombre, apellido y telefono
 * @returns {Object|null} Respuesta del servidor o null si hay error
 */
const addContact = async (contact) => {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(contact)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error adding contact: ", error);
        return null;
    }
};

/**
 * Función para mostrar mensajes al usuario con iconos
 * @param {string} text - Texto del mensaje
 * @param {string} type - Tipo de mensaje ('success' o 'error')
 */
const showMessage = (text, type) => {
    const messageElement = document.getElementById("message");
    messageElement.innerHTML = '';

    // Crear icono basado en el tipo de mensaje
    const icon = document.createElement("i");
    
    if (type === "success") {
        icon.classList.add("fas", "fa-check-circle");
    } else if (type === "error") {
        icon.classList.add("fas", "fa-times-circle");
    }

    // Agregar icono y texto al mensaje
    messageElement.appendChild(icon);
    messageElement.appendChild(document.createTextNode(` ${text}`));

    // Aplicar estilos y mostrar
    messageElement.classList.remove("success", "error");
    messageElement.classList.add(type, "show");

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        messageElement.classList.remove("show");
    }, 3000);
};

/**
 * Función para validar los datos del formulario
 * @param {string} nombre - Nombre del contacto
 * @param {string} apellido - Apellido del contacto
 * @param {string} telefono - Teléfono del contacto
 * @returns {boolean} True si todos los campos son válidos
 */
const validateFormData = (nombre, apellido, telefono) => {
    if (!nombre || nombre.trim().length < 2) {
        showMessage("El nombre debe tener al menos 2 caracteres.", "error");
        return false;
    }
    
    if (!apellido || apellido.trim().length < 2) {
        showMessage("El apellido debe tener al menos 2 caracteres.", "error");
        return false;
    }
    
    if (!telefono || telefono.trim().length < 7) {
        showMessage("El teléfono debe tener al menos 7 dígitos.", "error");
        return false;
    }
    
    return true;
};

/**
 * Función principal que se ejecuta cuando el DOM está cargado
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Obtener elementos del DOM
    const contactListElement = document.getElementById("contact-list");
    const contactForm = document.getElementById("contact-form");
    const showContactsButton = document.getElementById("show-contacts");
    const modal = document.getElementById("contact-modal");
    const closeModalButton = document.getElementById("close-modal");

    /**
     * Función para renderizar la lista de contactos en el modal
     * @param {Array} contacts - Array de contactos
     */
    const displayContacts = (contacts) => {
        contactListElement.innerHTML = '';
        
        if (!contacts || contacts.length === 0) {
            contactListElement.innerHTML = `
                <div class="empty-state">
                    <p>📭 No hay contactos disponibles</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Agrega tu primer contacto usando el formulario</p>
                </div>
            `;
            return;
        }

        // Crear tarjeta para cada contacto
        contacts.forEach(contact => {
            const contactItem = document.createElement("div");
            contactItem.classList.add("contact-card");

            contactItem.innerHTML = `
                <h3>${contact.nombre} ${contact.apellido}</h3>
                <p>📞 ${contact.telefono}</p>
            `;

            contactListElement.appendChild(contactItem);
        });
    };

    /**
     * Función para cargar y mostrar contactos desde la API
     */
    const loadContacts = async () => {
        try {
            // Mostrar indicador de carga
            contactListElement.innerHTML = `
                <div class="empty-state">
                    <p>⏳ Cargando contactos...</p>
                </div>
            `;

            const contacts = await fetchContacts();
            
            if (contacts !== null) {
                displayContacts(contacts);
            } else {
                displayContacts([]);
                showMessage("No se ha podido cargar la lista de contactos.", "error");
            }
        } catch (error) {
            console.error("Error loading contacts:", error);
            displayContacts([]);
            showMessage("Error al cargar los contactos.", "error");
        }
    };

    /**
     * Función para mostrar el modal
     */
    const showModal = () => {
        modal.style.display = "block";
        loadContacts();
    };

    /**
     * Función para ocultar el modal
     */
    const closeModal = () => {
        modal.style.display = "none";
    };

    /**
     * Manejador del evento de envío del formulario
     */
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Obtener y limpiar valores del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        // Validar datos
        if (!validateFormData(nombre, apellido, telefono)) {
            return;
        }

        try {
            // Crear objeto de contacto
            const newContact = { nombre, apellido, telefono };
            
            // Enviar a la API
            const result = await addContact(newContact);

            if (result !== null) {
                showMessage("Se ha enviado correctamente.", "success");
                contactForm.reset();
                
                // Si el modal está abierto, recargar la lista
                if (modal.style.display === "block") {
                    setTimeout(loadContacts, 1000);
                }
            } else {
                showMessage("No se ha podido enviar.", "error");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            showMessage("Error al enviar el contacto.", "error");
        }
    });

    /**
     * Event listeners para el modal
     */
    showContactsButton.addEventListener("click", showModal);
    closeModalButton.addEventListener("click", closeModal);

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "block") {
            closeModal();
        }
    });

    console.log("Agenda de contactos inicializada correctamente");
});