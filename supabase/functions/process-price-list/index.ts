
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode as base64Decode } from "https://deno.land/std@0.177.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://sawuhvmamfznbmyjjdfv.supabase.co'
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhd3Vodm1hbWZ6bmJteWpqZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzUxOTIsImV4cCI6MjA1NzA1MTE5Mn0.t1RSPI2tajRPANW6GEyJBQ2YonU_Aq-ctngzswZsStg'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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

    // Decode base64 file
    const binaryData = base64Decode(file.split(',')[1])
    
    // Create a blob from the binary data
    const blob = new Blob([binaryData], { type: 'application/pdf' })
    
    // Convert blob to base64 data URL for OpenAI
    const fileReader = new FileReader()
    const fileBase64 = await new Promise<string>((resolve) => {
      fileReader.onloadend = () => resolve(fileReader.result as string)
      fileReader.readAsDataURL(blob)
    })

    // Call OpenAI API with the file content
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
            size, brand, model, cost (as a number). Do not include any other text in your response.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all tyre information from this price list.' },
              {
                type: 'image_url',
                image_url: {
                  url: fileBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for more deterministic output
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const openAIResponse = await response.json()
    const content = openAIResponse.choices[0].message.content
    
    // Parse the response to extract the JSON data
    let extractedData = []
    try {
      // Try to parse the entire response as JSON
      extractedData = JSON.parse(content)
    } catch (e) {
      // If that fails, try to extract JSON from the text response
      console.log("Couldn't parse full response as JSON, attempting to extract JSON part")
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0])
        } catch (jsonError) {
          console.error("Error parsing extracted JSON:", jsonError)
          throw new Error("Failed to parse JSON from OpenAI response")
        }
      } else {
        throw new Error("Could not extract JSON data from OpenAI response")
      }
    }

    console.log(`Extracted ${extractedData.length} tyre prices`)

    // Validate the extracted data
    const validatedData = extractedData
      .filter(item => 
        item.size && item.brand && item.model && 
        typeof item.cost === 'number' && item.cost > 0
      )
      .map(item => ({
        size: item.size,
        brand: item.brand,
        model: item.model,
        cost: item.cost
      }))

    console.log(`Validated ${validatedData.length} tyre prices`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${validatedData.length} tyre prices`,
        data: {
          supplierId,
          rows: validatedData,
          total: validatedData.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing price list:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An error occurred while processing the price list',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
