# Documentación Técnica de la API de Formulario con Resend

## Resumen

Esta API proporciona un endpoint que procesa solicitudes de formularios de contacto y envía los datos recibidos como correos electrónicos utilizando el servicio Resend.

## Base URL

```
https://nodejs-api-resend-devhub-production.up.railway.app
```

## Endpoints

### POST /api/send-email

Procesa los datos del formulario y envía un correo electrónico.

#### Headers

| Nombre | Valor |
|--------|-------|
| Content-Type | application/json |

#### Request Body

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|------------|
| nombre | string | Sí | Nombre completo del remitente | Mínimo 1 carácter |
| celular | string | Sí | Número de teléfono celular | Formato chileno: `^(\+?56)?9\d{8}$` |
| email | string | Sí | Correo electrónico del remitente | Formato email válido |
| asunto | string | No* | Asunto del mensaje | - |
| servicios | array de strings | No* | Lista de servicios seleccionados | - |
| mensaje | string | Sí | Contenido del mensaje | Mínimo 1 carácter |

**Nota**: Al menos uno de los campos `asunto` o `servicios` debe estar presente.

#### Códigos de respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Éxito. El correo se envió correctamente |
| 400 | Error de validación en los datos enviados |
| 500 | Error interno del servidor |

#### Respuesta exitosa (200)

```json
{
  "success": true,
  "message": "Mensaje enviado correctamente"
}
```

#### Respuesta de error (400/500)

```json
{
  "error": "Descripción del error"
}
```

## Ejemplos de implementación

### Vanilla JavaScript

```javascript
async function enviarFormulario(datosFormulario) {
  try {
    const response = await fetch('https://nodejs-api-resend-devhub-production.up.railway.app/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosFormulario)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar el formulario');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Axios

```javascript
import axios from 'axios';

async function enviarFormulario(datosFormulario) {
  try {
    const response = await axios.post(
      'https://nodejs-api-resend-devhub-production.up.railway.app/api/send-email',
      datosFormulario,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error del servidor:', error.response.data);
      throw new Error(error.response.data.error || 'Error al enviar el formulario');
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      console.error('Error de conexión:', error.request);
      throw new Error('No se pudo conectar al servidor');
    } else {
      // Ocurrió un error al configurar la solicitud
      console.error('Error:', error.message);
      throw error;
    }
  }
}
```

## Modelo de datos detallado

### Formato de envío

```typescript
interface FormularioContacto {
  nombre: string;           // Nombre completo del remitente
  celular: string;          // Número de celular con formato chileno (+56912345678 o 912345678)
  email: string;            // Email válido (example@domain.com)
  asunto?: string;          // Asunto del mensaje (opcional si hay servicios)
  servicios?: string[];     // Lista de servicios seleccionados (opcional si hay asunto)
  mensaje: string;          // Contenido del mensaje
}
```

## Notas de implementación

1. **CORS**: La API tiene habilitado CORS para todos los orígenes, por lo que se puede consumir desde cualquier dominio.
2. **Almacenamiento**: La API no almacena los datos del formulario en ninguna base de datos, solo los procesa y envía por correo.
3. **Limitación de tasa**: No hay limitación de tasa implementada. Considera implementar medidas anti-spam en el frontend.
4. **Seguridad**: Los datos se envían a través de HTTPS para garantizar la seguridad en tránsito.

## Consideraciones para el frontend

1. Implementa validaciones en el lado del cliente antes de enviar los datos para mejorar la experiencia del usuario.
2. Muestra un estado de carga durante la comunicación con la API.
3. Implementa manejo de errores adecuado para informar al usuario sobre problemas.
4. Considera añadir un captcha para prevenir envíos automatizados.
