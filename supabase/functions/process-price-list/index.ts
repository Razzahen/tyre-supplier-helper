
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode as base64Decode } from "https://deno.land/std@0.177.0/encoding/base64.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://sawuhvmamfznbmyjjdfv.supabase.co'
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhd3Vodm1hbWZ6bmJteWpqZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzUxOTIsImV4cCI6MjA1NzA1MTE5Mn0.t1RSPI2tajRPANW6GEyJBQ2YonU_Aq-ctngzswZsStg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Validate tyre size format (e.g., 205/55R16)
function isValidTyreSize(size: string): boolean {
  const sizeRegex = /^(\d+)\/(\d+)R(\d+)$/i;
  return sizeRegex.test(size);
}

// Validate tyre data
function validateTyreData(item: any): { valid: boolean, errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!item.size) errors.push('Missing size');
  if (!item.brand) errors.push('Missing brand');
  if (!item.model) errors.push('Missing model');
  if (typeof item.cost !== 'number' || item.cost <= 0) errors.push('Invalid cost');
  
  // Validate size format if present
  if (item.size && !isValidTyreSize(item.size)) {
    errors.push(`Invalid size format: ${item.size}. Expected format like 205/55R16`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const { file, supplierId, fileName } = await req.json()
    
    if (!file || !supplierId) {
      throw new Error('Missing required fields: file and supplierId')
    }

    console.log(`Processing price list for supplier ${supplierId}`)
    console.log(`Filename: ${fileName}`)
    
    // Extract base64 content for direct text processing
    let fileBase64 = file;
    if (file.includes(';base64,')) {
      fileBase64 = file.split(';base64,')[1];
    }
    
    // Call OpenAI API to extract data from the price list using text content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a specialized AI for extracting tyre price information from price lists. 
            Extract all tyre details including size (format: WIDTH/ASPECT_RATIO/DIAMETER like 205/55R16), 
            brand, model, and cost. Return the data as a JSON array with objects containing these fields: 
            size, brand, model, cost (as a number). 
            
            IMPORTANT VALIDATIONS:
            - Ensure all sizes follow the standard format (e.g., 205/55R16).
            - All costs must be positive numbers.
            - Brand and model must be non-empty strings.
            - Do not include any other text in your response, only the JSON array.
            - If you're uncertain about any entry, skip it rather than guessing.
            - If you cannot extract any valid data, return an empty array.`
          },
          {
            role: 'user',
            content: `I have a price list in base64 format that contains tyre information. Please extract all tyre information including sizes (in WIDTH/ASPECT_RATIO/DIAMETER format like 205/55R16), brands, models, and costs. The file content is: ${fileBase64}. Respond only with a JSON array containing objects with size, brand, model, and cost fields.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for more deterministic output
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const openAIResponse = await response.json();
    const content = openAIResponse.choices[0].message.content;
    
    console.log('OpenAI response received successfully');
    
    // Parse the response to extract the JSON data
    let extractedData = [];
    let parseError = null;
    
    try {
      // Try to parse the entire response as JSON
      extractedData = JSON.parse(content);
      console.log(`Successfully parsed JSON with ${extractedData.length} items`);
    } catch (e) {
      // If that fails, try to extract JSON from the text response
      console.log("Couldn't parse full response as JSON, attempting to extract JSON part");
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0]);
          console.log(`Successfully extracted and parsed JSON with ${extractedData.length} items`);
        } catch (jsonError) {
          parseError = `Error parsing extracted JSON: ${jsonError.message}`;
          console.error(parseError);
        }
      } else {
        parseError = "Could not extract JSON data from OpenAI response";
        console.error(parseError);
      }
    }

    if (extractedData.length === 0) {
      throw new Error(parseError || "No valid data could be extracted from the document");
    }

    console.log(`Extracted ${extractedData.length} tyre prices`);

    // Validate the extracted data
    const validatedData = [];
    const invalidItems = [];
    
    for (const item of extractedData) {
      const validation = validateTyreData(item);
      if (validation.valid) {
        validatedData.push({
          size: item.size,
          brand: item.brand,
          model: item.model,
          cost: item.cost
        });
      } else {
        invalidItems.push({
          item,
          errors: validation.errors
        });
      }
    }

    console.log(`Validated ${validatedData.length} tyre prices`);
    console.log(`Found ${invalidItems.length} invalid items`);
    
    if (invalidItems.length > 0) {
      console.log('Invalid items details:', JSON.stringify(invalidItems));
    }

    if (validatedData.length === 0) {
      throw new Error("No valid tyre data found in the document. Please check the file format and content.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${validatedData.length} tyre prices${invalidItems.length > 0 ? ` (ignored ${invalidItems.length} invalid entries)` : ''}`,
        data: {
          supplierId,
          rows: validatedData,
          invalidRows: invalidItems.map(i => `${i.item.brand || 'Unknown'} ${i.item.model || 'Unknown'} - ${i.errors.join(', ')}`),
          total: validatedData.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing price list:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An error occurred while processing the price list',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
