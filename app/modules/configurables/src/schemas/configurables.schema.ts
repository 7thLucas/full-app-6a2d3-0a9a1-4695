/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};

export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "heroImage",
      type: "file",
      required: false,
      label: "Hero Image",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "instructorName",
      type: "string",
      required: false,
      label: "Instructor / Academy Name",
    },
    {
      fieldName: "instructorBio",
      type: "string",
      required: false,
      label: "Instructor Bio",
    },
    {
      fieldName: "instructorPhoto",
      type: "file",
      required: false,
      label: "Instructor Photo",
    },
    {
      fieldName: "heroHeading",
      type: "string",
      required: false,
      label: "Hero Heading",
    },
    {
      fieldName: "heroSubheading",
      type: "string",
      required: false,
      label: "Hero Sub-Heading",
    },
    {
      fieldName: "heroCta",
      type: "string",
      required: false,
      label: "Hero CTA Button Label",
    },
    {
      fieldName: "featuresSection",
      type: "object",
      required: false,
      label: "Features Section",
      fields: [
        { fieldName: "heading", type: "string", required: false, label: "Heading" },
        {
          fieldName: "features",
          type: "array",
          required: false,
          label: "Feature Items",
          item: {
            type: "object",
            fields: [
              { fieldName: "icon", type: "string", required: false, label: "Icon (lucide name)" },
              { fieldName: "title", type: "string", required: true, label: "Title" },
              { fieldName: "description", type: "string", required: false, label: "Description" },
            ],
          },
        },
      ],
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
    },
    {
      fieldName: "contactEmail",
      type: "string",
      required: false,
      label: "Contact Email",
    },
    {
      fieldName: "socialLinks",
      type: "object",
      required: false,
      label: "Social Links",
      fields: [
        { fieldName: "youtube", type: "url", required: false, label: "YouTube" },
        { fieldName: "instagram", type: "url", required: false, label: "Instagram" },
        { fieldName: "telegram", type: "url", required: false, label: "Telegram" },
        { fieldName: "whatsapp", type: "url", required: false, label: "WhatsApp" },
      ],
    },
    {
      fieldName: "enableNotifications",
      type: "boolean",
      required: false,
      label: "Enable Notifications",
    },
    {
      fieldName: "enableChat",
      type: "boolean",
      required: false,
      label: "Enable Chat / Query Board",
    },
    {
      fieldName: "itemsPerPage",
      type: "number",
      required: false,
      label: "Courses Per Page",
      min: 4,
      max: 48,
    },
  ],
};
